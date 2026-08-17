import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES } from './base'
import { LeaveRequestStatus, type LeaveRequestStatusValue } from './LeaveRequestStatus'

export { LeaveRequestStatus }
export type { LeaveRequestStatusValue }

export interface LeaveRequestInput {
  employeeId: string
  leaveTypeId: string
  startDate: Date
  endDate: Date
  totalDays: number
  reason?: string
  status?: LeaveRequestStatusValue
}

export class LeaveRequest extends Realm.Object<LeaveRequest> {
  declare _id: string
  declare employeeId: string
  declare leaveTypeId: string
  declare startDate: Date
  declare endDate: Date
  declare totalDays: number
  declare reason: string | null
  declare status: LeaveRequestStatusValue
  declare rejectionReason: string | null
  declare isDeleted: boolean
  declare deletedAt: Date | null
  declare createdAt: Date
  declare updatedAt: Date

  static schema: Realm.ObjectSchema = {
    name: 'LeaveRequest',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      employeeId: { type: 'string', indexed: true },
      leaveTypeId: { type: 'string', indexed: true },
      startDate: 'date',
      endDate: 'date',
      totalDays: { type: 'int' },
      reason: { type: 'string', optional: true },
      status: { type: 'string', default: LeaveRequestStatus.Draft },
      rejectionReason: { type: 'string', optional: true },
    },
  }
}

export type LeaveRequestEntity = LeaveRequest
