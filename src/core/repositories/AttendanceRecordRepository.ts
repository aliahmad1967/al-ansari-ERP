import { AttendanceRecord, type AttendanceRecordInput } from '../models/AttendanceRecord'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class AttendanceRecordRepository extends BaseRepository<AttendanceRecord, AttendanceRecordInput> {
  protected get objectType(): string {
    return 'AttendanceRecord'
  }

  protected get modelClass(): ModelConstructor<AttendanceRecord> {
    return AttendanceRecord
  }

  findByEmployee(employeeId: string, options: FindOptions = {}): AttendanceRecord[] {
    return this.query('employeeId == $0', [employeeId], options)
  }

  findByDateRange(startDate: Date, endDate: Date, options: FindOptions = {}): AttendanceRecord[] {
    return this.query('date >= $0 AND date <= $1', [startDate, endDate], options)
  }

  findByEmployeeAndDateRange(employeeId: string, startDate: Date, endDate: Date): AttendanceRecord[] {
    return this.query('employeeId == $0 AND date >= $1 AND date <= $2', [employeeId, startDate, endDate])
  }

  findToday(employeeId: string): AttendanceRecord | null {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return this.first('employeeId == $0 AND date >= $1 AND date < $2', [employeeId, today, tomorrow])
  }

  findByMonth(year: number, month: number): AttendanceRecord[] {
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0, 23, 59, 59)
    return this.findByDateRange(start, end)
  }
}
