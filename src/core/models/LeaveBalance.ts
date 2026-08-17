import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES } from './base'

export interface LeaveBalanceInput {
  employeeId: string
  leaveTypeId: string
  year: number
  totalDays: number
  usedDays: number
  carriedOverDays?: number
  notes?: string
}

export class LeaveBalance extends Realm.Object<LeaveBalance> {
  declare _id: string
  declare employeeId: string
  declare leaveTypeId: string
  declare year: number
  declare totalDays: number
  declare usedDays: number
  declare carriedOverDays: number
  declare notes: string | null
  declare isDeleted: boolean
  declare deletedAt: Date | null
  declare createdAt: Date
  declare updatedAt: Date

  get remainingDays(): number {
    return this.totalDays + this.carriedOverDays - this.usedDays
  }

  static schema: Realm.ObjectSchema = {
    name: 'LeaveBalance',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      employeeId: { type: 'string', indexed: true },
      leaveTypeId: { type: 'string', indexed: true },
      year: { type: 'int', indexed: true },
      totalDays: { type: 'int', default: 0 },
      usedDays: { type: 'int', default: 0 },
      carriedOverDays: { type: 'int', default: 0 },
      notes: { type: 'string', optional: true },
    },
  }
}

export type LeaveBalanceEntity = LeaveBalance
