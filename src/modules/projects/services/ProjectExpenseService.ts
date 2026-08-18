import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import type { ProjectExpense, ProjectExpenseInput, ProjectExpenseStatusValue } from '@/core/models/ProjectExpense'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import { ProjectExpenseRepository } from '@/core/repositories/ProjectExpenseRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'

export class ProjectExpenseService {
  private readonly repo = new ProjectExpenseRepository()
  private readonly auditRepo = new AuditRepository()

  findAll(options: FindOptions = {}): ProjectExpense[] {
    return this.repo.findAll(options)
  }

  findById(id: string): ProjectExpense | null {
    return this.repo.findById(id)
  }

  count(): number {
    return this.repo.count()
  }

  findByProject(projectId: string, options?: FindOptions): ProjectExpense[] {
    return this.repo.findByProject(projectId, options)
  }

  findByEmployee(employeeId: string): ProjectExpense[] {
    return this.repo.findByEmployee(employeeId)
  }

  create(input: ProjectExpenseInput, actorUserId?: string, actorUsername?: string): ProjectExpense {
    const expense = this.repo.create(input)
    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'projects',
      resourceType: 'ProjectExpense',
      resourceId: expense._id,
      summary: `Expense "${expense.description}" (${expense.amount} ${expense.currency}) recorded`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return expense
  }

  update(id: string, changes: Partial<ProjectExpenseInput>, actorUserId?: string, actorUsername?: string): ProjectExpense {
    const expense = this.repo.update(id, changes)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'projects',
      resourceType: 'ProjectExpense',
      resourceId: expense._id,
      summary: `Expense "${expense.description}" updated`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return expense
  }

  archive(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const expense = this.repo.findById(id)
    const result = this.repo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'projects',
        resourceType: 'ProjectExpense',
        resourceId: id,
        summary: `Expense "${expense?.description ?? id}" archived`,
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }

  restore(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const result = this.repo.restore(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Update,
        module: 'projects',
        resourceType: 'ProjectExpense',
        resourceId: id,
        summary: 'Expense restored',
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }

  updateStatus(id: string, status: ProjectExpenseStatusValue, actorUserId?: string, actorUsername?: string): ProjectExpense {
    const expense = this.repo.update(id, { status })
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'projects',
      resourceType: 'ProjectExpense',
      resourceId: expense._id,
      summary: `Expense "${expense.description}" status changed to ${status}`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return expense
  }

  getProjectExpenseSummary(projectId: string): {
    totalExpenses: number
    pendingAmount: number
    approvedAmount: number
    byCategory: Record<string, number>
  } {
    const expenses = this.repo.findByProject(projectId)
    const byCategory: Record<string, number> = {}
    for (const expense of expenses) {
      byCategory[expense.category] = (byCategory[expense.category] ?? 0) + expense.amount
    }
    return {
      totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
      pendingAmount: expenses.filter((e) => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0),
      approvedAmount: expenses.filter((e) => e.status === 'approved' || e.status === 'reimbursed').reduce((sum, e) => sum + e.amount, 0),
      byCategory,
    }
  }
}
