import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES } from './base'
import { AttendanceStatus, type AttendanceStatusValue, CheckInOutSource, type CheckInOutSourceValue } from './AttendanceStatus'

export { AttendanceStatus, CheckInOutSource }
export type { AttendanceStatusValue, CheckInOutSourceValue }

export interface AttendanceRecordInput {
  employeeId: string
  date: Date
  checkIn?: Date
  checkOut?: Date
  scheduledCheckIn?: Date
  scheduledCheckOut?: Date
  workingHours?: number
  overtimeMinutes?: number
  status: AttendanceStatusValue
  checkInSource?: CheckInOutSourceValue
  checkOutSource?: CheckInOutSourceValue
  lateMinutes?: number
  earlyDepartureMinutes?: number
  notes?: string
}

export class AttendanceRecord extends Realm.Object<AttendanceRecord> {
  declare _id: string
  declare employeeId: string
  declare date: Date
  declare checkIn: Date | null
  declare checkOut: Date | null
  declare scheduledCheckIn: Date | null
  declare scheduledCheckOut: Date | null
  declare workingHours: number
  declare overtimeMinutes: number
  declare status: AttendanceStatusValue
  declare checkInSource: string | null
  declare checkOutSource: string | null
  declare lateMinutes: number
  declare earlyDepartureMinutes: number
  declare notes: string | null
  declare isDeleted: boolean
  declare deletedAt: Date | null
  declare createdAt: Date
  declare updatedAt: Date

  static schema: Realm.ObjectSchema = {
    name: 'AttendanceRecord',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      employeeId: { type: 'string', indexed: true },
      date: { type: 'date', indexed: true },
      checkIn: { type: 'date', optional: true },
      checkOut: { type: 'date', optional: true },
      scheduledCheckIn: { type: 'date', optional: true },
      scheduledCheckOut: { type: 'date', optional: true },
      workingHours: { type: 'double', default: 0 },
      overtimeMinutes: { type: 'int', default: 0 },
      status: { type: 'string', default: AttendanceStatus.Absent },
      checkInSource: { type: 'string', optional: true },
      checkOutSource: { type: 'string', optional: true },
      lateMinutes: { type: 'int', default: 0 },
      earlyDepartureMinutes: { type: 'int', default: 0 },
      notes: { type: 'string', optional: true },
    },
  }
}

export type AttendanceRecordEntity = AttendanceRecord
