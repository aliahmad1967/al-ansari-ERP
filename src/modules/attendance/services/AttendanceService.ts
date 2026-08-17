import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import { AttendanceRecordRepository } from '@/core/repositories/AttendanceRecordRepository'
import { ShiftRepository } from '@/core/repositories/ShiftRepository'
import type { AttendanceRecordInput, AttendanceStatusValue } from '@/core/models/AttendanceRecord'
import type { ShiftInput } from '@/core/models/Shift'
import type { FindOptions } from '@/core/repositories/BaseRepository'

export class AttendanceService {
  private readonly recordRepo = new AttendanceRecordRepository()
  private readonly shiftRepo = new ShiftRepository()
  private readonly auditRepo = new AuditRepository()

  findAllRecords(options: FindOptions = {}) { return this.recordRepo.findAll(options) }
  findRecordById(id: string) { return this.recordRepo.findById(id) }
  findRecordsByEmployee(employeeId: string) { return this.recordRepo.findByEmployee(employeeId) }
  findRecordsByMonth(year: number, month: number) { return this.recordRepo.findByMonth(year, month) }
  findTodayRecord(employeeId: string) { return this.recordRepo.findToday(employeeId) }
  findAllShifts() { return this.shiftRepo.findAll() }
  findActiveShifts() { return this.shiftRepo.findActive() }

  createRecord(input: AttendanceRecordInput, actorUserId?: string, actorUsername?: string) {
    const record = this.recordRepo.create(input)
    this.auditRepo.create({
      action: AuditAction.Create, module: 'hr', resourceType: 'AttendanceRecord',
      resourceId: record._id, summary: `Attendance recorded for employee ${input.employeeId}`,
      outcome: AuditOutcome.Success, actorUserId, actorUsername,
    })
    return record
  }

  checkIn(employeeId: string, source: string = 'manual', actorUserId?: string, actorUsername?: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const existing = this.recordRepo.findToday(employeeId)
    if (existing) return existing
    const record = this.recordRepo.create({
      employeeId, date: today, checkIn: new Date(), status: 'present' as AttendanceStatusValue,
      checkInSource: source as 'manual',
    })
    this.auditRepo.create({
      action: AuditAction.Create, module: 'hr', resourceType: 'AttendanceRecord',
      resourceId: record._id, summary: `Check-in for employee ${employeeId}`,
      outcome: AuditOutcome.Success, actorUserId, actorUsername,
    })
    return record
  }

  checkOut(employeeId: string, actorUserId?: string, actorUsername?: string) {
    const record = this.recordRepo.findToday(employeeId)
    if (!record) return null
    const updated = this.recordRepo.update(record._id, { checkOut: new Date() } as Partial<AttendanceRecordInput>)
    this.auditRepo.create({
      action: AuditAction.Update, module: 'hr', resourceType: 'AttendanceRecord',
      resourceId: updated._id, summary: `Check-out for employee ${employeeId}`,
      outcome: AuditOutcome.Success, actorUserId, actorUsername,
    })
    return updated
  }

  createShift(input: ShiftInput, actorUserId?: string, actorUsername?: string) {
    const shift = this.shiftRepo.create(input)
    this.auditRepo.create({
      action: AuditAction.Create, module: 'hr', resourceType: 'Shift',
      resourceId: shift._id, summary: `Shift "${input.name}" created`,
      outcome: AuditOutcome.Success, actorUserId, actorUsername,
    })
    return shift
  }
}
