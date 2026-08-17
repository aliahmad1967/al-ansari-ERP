/**
 * PayrollService — orchestrates the full payroll lifecycle.
 *
 * Workflow: Draft → Calculate → Review → Approve → Finalize → Payslips
 *
 * Finalized payroll is immutable. Corrections must use the reversal mechanism.
 */

import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import { PayrollRunStatus, type PayrollRun, type PayrollRunStatusValue } from '@/core/models/PayrollRun'
import type { PayrollItemStatusValue } from '@/core/models/PayrollItem'
import type { PayrollItem } from '@/core/models/PayrollItem'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import { EmployeeRepository } from '@/core/repositories/EmployeeRepository'
import { EmployeeSalaryRepository } from '@/core/repositories/EmployeeSalaryRepository'
import { EmployeeSalaryItemRepository } from '@/core/repositories/EmployeeSalaryItemRepository'
import { PayrollRunRepository } from '@/core/repositories/PayrollRunRepository'
import { PayrollItemRepository } from '@/core/repositories/PayrollItemRepository'
import { PayrollLineItemRepository } from '@/core/repositories/PayrollLineItemRepository'
import { PayslipRepository } from '@/core/repositories/PayslipRepository'
import { SalaryComponentRepository } from '@/core/repositories/SalaryComponentRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'
import {
  batchCalculatePayroll,
} from './PayrollCalculationEngine'

export class PayrollService {
  private readonly runRepo = new PayrollRunRepository()
  private readonly itemRepo = new PayrollItemRepository()
  private readonly lineItemRepo = new PayrollLineItemRepository()
  private readonly payslipRepo = new PayslipRepository()
  private readonly employeeRepo = new EmployeeRepository()
  private readonly salaryRepo = new EmployeeSalaryRepository()
  private readonly salaryItemRepo = new EmployeeSalaryItemRepository()
  private readonly componentRepo = new SalaryComponentRepository()
  private readonly auditRepo = new AuditRepository()

  // ---- Payroll Runs ----

  findAllRuns(options: FindOptions = {}): PayrollRun[] {
    return this.runRepo.findAll(options)
  }

  findRunById(id: string): PayrollRun | null {
    return this.runRepo.findById(id)
  }

  findRunsByPeriod(periodId: string): PayrollRun[] {
    return this.runRepo.findByPeriod(periodId)
  }

  findLatestRunByPeriod(periodId: string): PayrollRun | null {
    return this.runRepo.findLatestByPeriod(periodId)
  }

  createRun(periodId: string, notes?: string, actorUserId?: string, actorUsername?: string): PayrollRun {
    const runNumber = this.runRepo.getNextRunNumber(periodId)
    const run = this.runRepo.create({
      periodId,
      notes,
    })

    // Update run number
    this.runRepo.update(run._id, { runNumber })

    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'hr',
      resourceType: 'PayrollRun',
      resourceId: run._id,
      summary: `Payroll run #${runNumber} created for period`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return this.runRepo.findById(run._id)!
  }

  /**
   * Calculates payroll for the given run.
   * Fetches all active employees with active salaries, applies rules engine,
   * creates PayrollItems and PayrollLineItems.
   */
  calculateRun(runId: string, actorUserId?: string, actorUsername?: string): PayrollRun {
    const run = this.runRepo.findById(runId)
    if (!run) throw new Error('Payroll run not found')
    if (run.status !== PayrollRunStatus.Draft) {
      throw new Error(`Payroll run must be in Draft status to calculate. Current: ${run.status}`)
    }

    // Mark as calculating
    this.runRepo.update(runId, { status: PayrollRunStatus.Calculating })

    // Get all active employee salaries for the period
    const activeSalaries = this.salaryRepo.findActive()

    const assignments: Array<{
      salary: typeof activeSalaries[number]
      components: ReturnType<SalaryComponentRepository['findActiveByStructure']>
      salaryItems: ReturnType<EmployeeSalaryItemRepository['findByEmployeeSalary']>
    }> = []

    for (const salary of activeSalaries) {
      // Skip employees without an active contract or inactive employees
      const employee = this.employeeRepo.findById(salary.employeeId)
      if (!employee || employee.status !== 'active') continue

      const components = this.componentRepo.findActiveByStructure(salary.structureId)
      const salaryItems = this.salaryItemRepo.findByEmployeeSalary(salary._id)
      assignments.push({ salary, components, salaryItems })
    }

    const { results, totalGross, totalDeductions, totalNet, employeeCount } =
      batchCalculatePayroll(assignments)

    // Delete existing items (if recalculating)
    this.itemRepo.deleteByPayrollRun(runId)

    // Create PayrollItems and PayrollLineItems
    for (const result of results) {
      const item = this.itemRepo.create({
        payrollRunId: runId,
        employeeId: result.employeeId,
        periodId: run.periodId,
        basicSalary: result.basicSalary,
        totalEarnings: result.totalEarnings,
        totalDeductions: result.totalDeductions,
        totalBenefits: result.totalBenefits,
        netPay: result.netPay,
        currency: result.currency,
      })

      for (const line of result.lines) {
        this.lineItemRepo.create({
          payrollItemId: item._id,
          componentId: line.componentId,
          componentCode: line.componentCode,
          componentName: line.componentName,
          componentNameAr: line.componentNameAr,
          componentType: line.componentType,
          baseAmount: line.baseAmount,
          amount: line.amount,
        })
      }
    }

    // Update run totals
    const updatedRun = this.runRepo.update(runId, {
      status: PayrollRunStatus.Calculated,
      totalGross,
      totalDeductions,
      totalNet,
      employeeCount,
    })

    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'hr',
      resourceType: 'PayrollRun',
      resourceId: runId,
      summary: `Payroll run #${run.runNumber} calculated: ${employeeCount} employees, net ${totalNet}`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return updatedRun
  }

  /**
   * Move run to reviewing status.
   */
  reviewRun(runId: string, actorUserId?: string, actorUsername?: string): PayrollRun {
    const run = this.requireRun(runId, PayrollRunStatus.Calculated)
    const updated = this.runRepo.update(runId, { status: PayrollRunStatus.Reviewing })
    this.auditRepo.create({
      action: AuditAction.Approve,
      module: 'hr',
      resourceType: 'PayrollRun',
      resourceId: runId,
      summary: `Payroll run #${run.runNumber} moved to review`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return updated
  }

  /**
   * Approve the payroll run.
   */
  approveRun(runId: string, approverUserId: string, approverUsername: string): PayrollRun {
    const run = this.requireRun(runId, PayrollRunStatus.Reviewing)
    const updated = this.runRepo.update(runId, {
      status: PayrollRunStatus.Approved,
      approvedBy: approverUsername,
      approvedAt: new Date(),
    })
    this.auditRepo.create({
      action: AuditAction.Approve,
      module: 'hr',
      resourceType: 'PayrollRun',
      resourceId: runId,
      summary: `Payroll run #${run.runNumber} approved by ${approverUsername}`,
      outcome: AuditOutcome.Success,
      actorUserId: approverUserId,
      actorUsername: approverUsername,
    })
    return updated
  }

  /**
   * Finalize the payroll run — makes it immutable.
   * Also generates payslips for all items.
   */
  finalizeRun(runId: string, finalizerUserId: string, finalizerUsername: string): PayrollRun {
    const run = this.requireRun(runId, PayrollRunStatus.Approved)
    const updated = this.runRepo.update(runId, {
      status: PayrollRunStatus.Finalized,
      finalizedBy: finalizerUsername,
      finalizedAt: new Date(),
    })

    // Generate payslips
    const items = this.itemRepo.findByPayrollRun(runId)
    for (const item of items) {
      const existing = this.payslipRepo.findByPayrollItem(item._id)
      if (!existing) {
        this.payslipRepo.create({
          payrollItemId: item._id,
          employeeId: item.employeeId,
          periodId: item.periodId,
          payslipNumber: this.payslipRepo.getNextPayslipNumber(),
          basicSalary: item.basicSalary,
          totalEarnings: item.totalEarnings,
          totalDeductions: item.totalDeductions,
          totalBenefits: item.totalBenefits,
          netPay: item.netPay,
          currency: item.currency,
        })
      }
    }

    this.auditRepo.create({
      action: AuditAction.Post,
      module: 'hr',
      resourceType: 'PayrollRun',
      resourceId: runId,
      summary: `Payroll run #${run.runNumber} finalized by ${finalizerUsername}`,
      outcome: AuditOutcome.Success,
      actorUserId: finalizerUserId,
      actorUsername: finalizerUsername,
    })
    return updated
  }

  /**
   * Reverses a finalized payroll run by creating a new opposing run.
   * The original run remains immutable; a new run with reversed amounts is created.
   */
  reverseRun(runId: string, reason: string, actorUserId: string, actorUsername: string): PayrollRun {
    const originalRun = this.requireRun(runId, PayrollRunStatus.Finalized)
    const newRunNumber = this.runRepo.getNextRunNumber(originalRun.periodId)

    const reversalRun = this.runRepo.create({
      periodId: originalRun.periodId,
      notes: `Reversal of run #${originalRun.runNumber}. Reason: ${reason}`,
      reversalOfId: runId,
    })
    this.runRepo.update(reversalRun._id, { runNumber: newRunNumber })

    // Create reversed items
    const originalItems = this.itemRepo.findByPayrollRun(runId)
    for (const item of originalItems) {
      const reversedItem = this.itemRepo.create({
        payrollRunId: reversalRun._id,
        employeeId: item.employeeId,
        periodId: item.periodId,
        basicSalary: -item.basicSalary,
        totalEarnings: -item.totalEarnings,
        totalDeductions: -item.totalDeductions,
        totalBenefits: -item.totalBenefits,
        netPay: -item.netPay,
        currency: item.currency,
      })

      // Copy line items with negated amounts
      const originalLines = this.lineItemRepo.findByPayrollItem(item._id)
      for (const line of originalLines) {
        this.lineItemRepo.create({
          payrollItemId: reversedItem._id,
          componentId: line.componentId,
          componentCode: line.componentCode,
          componentName: line.componentName,
          componentNameAr: line.componentNameAr,
          componentType: line.componentType,
          baseAmount: -line.baseAmount,
          amount: -line.amount,
        })
      }
    }

    // Mark original run as reversed
    this.runRepo.update(runId, {
      status: PayrollRunStatus.Reversed,
      reversedBy: actorUsername,
      reversedAt: new Date(),
    })

    // Finalize the reversal run
    this.runRepo.update(reversalRun._id, {
      status: PayrollRunStatus.Finalized,
      totalGross: -originalRun.totalGross,
      totalDeductions: -originalRun.totalDeductions,
      totalNet: -originalRun.totalNet,
      employeeCount: originalRun.employeeCount,
      finalizedBy: actorUsername,
      finalizedAt: new Date(),
    })

    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'hr',
      resourceType: 'PayrollRun',
      resourceId: reversalRun._id,
      summary: `Payroll run #${newRunNumber} created as reversal of #${originalRun.runNumber}: ${reason}`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return this.runRepo.findById(reversalRun._id)!
  }

  // ---- Payroll Items ----

  findItemsByRun(runId: string): PayrollItem[] {
    return this.itemRepo.findByPayrollRun(runId)
  }

  findItemById(id: string): PayrollItem | null {
    return this.itemRepo.findById(id)
  }

  findItemsByEmployee(employeeId: string): PayrollItem[] {
    return this.itemRepo.findByEmployee(employeeId)
  }

  getLineItems(payrollItemId: string) {
    return this.lineItemRepo.findByPayrollItem(payrollItemId)
  }

  updateItemStatus(id: string, status: PayrollItemStatusValue): PayrollItem {
    return this.itemRepo.update(id, { status })
  }

  // ---- Payslips ----

  findAllPayslips(options: FindOptions = {}) {
    return this.payslipRepo.findAll(options)
  }

  findPayslipById(id: string) {
    return this.payslipRepo.findById(id)
  }

  findPayslipsByEmployee(employeeId: string) {
    return this.payslipRepo.findByEmployee(employeeId)
  }

  findPayslipsByPeriod(periodId: string) {
    return this.payslipRepo.findByPeriod(periodId)
  }

  findPayslipByPayrollItem(payrollItemId: string) {
    return this.payslipRepo.findByPayrollItem(payrollItemId)
  }

  // ---- Validation ----

  private requireRun(runId: string, requiredStatus: PayrollRunStatusValue): PayrollRun {
    const run = this.runRepo.findById(runId)
    if (!run) throw new Error('Payroll run not found')
    if (run.status !== requiredStatus) {
      throw new Error(`Expected payroll run status "${requiredStatus}", got "${run.status}"`)
    }
    return run
  }
}
