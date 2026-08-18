import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import type { Timesheet, TimesheetInput, TimesheetStatusValue } from '@/core/models/Timesheet'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import { TimesheetRepository } from '@/core/repositories/TimesheetRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'

export class TimesheetService {
  private readonly repo = new TimesheetRepository()
  private readonly auditRepo = new AuditRepository()

  findAll(options: FindOptions = {}): Timesheet[] {
    return this.repo.findAll(options)
  }

  findById(id: string): Timesheet | null {
    return this.repo.findById(id)
  }

  count(): number {
    return this.repo.count()
  }

  findByProject(projectId: string, options?: FindOptions): Timesheet[] {
    return this.repo.findByProject(projectId, options)
  }

  findByEmployee(employeeId: string, options?: FindOptions): Timesheet[] {
    return this.repo.findByEmployee(employeeId, options)
  }

  findByDateRange(startDate: Date, endDate: Date): Timesheet[] {
    return this.repo.findByDateRange(startDate, endDate)
  }

  findByEmployeeAndDateRange(employeeId: string, startDate: Date, endDate: Date): Timesheet[] {
    return this.repo.findByEmployeeAndDateRange(employeeId, startDate, endDate)
  }

  create(input: TimesheetInput, actorUserId?: string, actorUsername?: string): Timesheet {
    const timesheet = this.repo.create(input)
    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'projects',
      resourceType: 'Timesheet',
      resourceId: timesheet._id,
      summary: `${timesheet.hours}h timesheet entry created for project`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return timesheet
  }

  update(id: string, changes: Partial<TimesheetInput>, actorUserId?: string, actorUsername?: string): Timesheet {
    const timesheet = this.repo.update(id, changes)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'projects',
      resourceType: 'Timesheet',
      resourceId: timesheet._id,
      summary: `Timesheet entry updated (${timesheet.hours}h)`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return timesheet
  }

  archive(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const timesheet = this.repo.findById(id)
    const result = this.repo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'projects',
        resourceType: 'Timesheet',
        resourceId: id,
        summary: `Timesheet entry (${timesheet?.hours ?? 0}h) deleted`,
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
        resourceType: 'Timesheet',
        resourceId: id,
        summary: 'Timesheet entry restored',
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }

  updateStatus(id: string, status: TimesheetStatusValue, actorUserId?: string, actorUsername?: string): Timesheet {
    const timesheet = this.repo.update(id, { status })
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'projects',
      resourceType: 'Timesheet',
      resourceId: timesheet._id,
      summary: `Timesheet entry status changed to ${status}`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return timesheet
  }

  getEmployeeHoursSummary(employeeId: string, startDate: Date, endDate: Date): {
    totalHours: number
    billableHours: number
    entryCount: number
  } {
    const entries = this.repo.findByEmployeeAndDateRange(employeeId, startDate, endDate)
    return {
      totalHours: entries.reduce((sum, e) => sum + e.hours, 0),
      billableHours: entries.filter((e) => e.billable).reduce((sum, e) => sum + e.hours, 0),
      entryCount: entries.length,
    }
  }
}
