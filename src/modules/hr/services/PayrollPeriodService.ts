import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import type { PayrollPeriod, PayrollPeriodInput, PayrollPeriodStatusValue } from '@/core/models/PayrollPeriod'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import { PayrollPeriodRepository } from '@/core/repositories/PayrollPeriodRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'

export class PayrollPeriodService {
  private readonly repo = new PayrollPeriodRepository()
  private readonly auditRepo = new AuditRepository()

  findAll(options: FindOptions = {}): PayrollPeriod[] {
    return this.repo.findAll(options)
  }

  findById(id: string): PayrollPeriod | null {
    return this.repo.findById(id)
  }

  findLatest(): PayrollPeriod | null {
    return this.repo.findLatest()
  }

  findOpen(): PayrollPeriod[] {
    return this.repo.findOpen()
  }

  findByYearMonth(year: number, month: number): PayrollPeriod | null {
    return this.repo.findByYearMonth(year, month)
  }

  findByStatus(status: PayrollPeriodStatusValue): PayrollPeriod[] {
    return this.repo.findByStatus(status)
  }

  create(input: PayrollPeriodInput, actorUserId?: string, actorUsername?: string): PayrollPeriod {
    const period = this.repo.create(input)
    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'hr',
      resourceType: 'PayrollPeriod',
      resourceId: period._id,
      summary: `Payroll period "${period.name}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return period
  }

  updateStatus(id: string, status: PayrollPeriodStatusValue, actorUserId?: string, actorUsername?: string): PayrollPeriod {
    const period = this.repo.update(id, { status })
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'hr',
      resourceType: 'PayrollPeriod',
      resourceId: period._id,
      summary: `Payroll period "${period.name}" status changed to ${status}`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return period
  }

  archive(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const period = this.repo.findById(id)
    const result = this.repo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'hr',
        resourceType: 'PayrollPeriod',
        resourceId: id,
        summary: `Payroll period "${period?.name ?? id}" archived`,
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
        module: 'hr',
        resourceType: 'PayrollPeriod',
        resourceId: id,
        summary: 'Payroll period restored',
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }
}
