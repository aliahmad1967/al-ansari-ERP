import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES } from './base'

export interface LeaveTypeInput {
  name: string
  nameAr?: string
  daysPerYear: number
  isPaid: boolean
  isCarryOver: boolean
  maxCarryOverDays?: number
  isActive?: boolean
  color?: string
  notes?: string
}

export class LeaveType extends Realm.Object<LeaveType> {
  declare _id: string
  declare name: string
  declare nameAr: string | null
  declare daysPerYear: number
  declare isPaid: boolean
  declare isCarryOver: boolean
  declare maxCarryOverDays: number
  declare isActive: boolean
  declare color: string | null
  declare notes: string | null
  declare isDeleted: boolean
  declare deletedAt: Date | null
  declare createdAt: Date
  declare updatedAt: Date

  static schema: Realm.ObjectSchema = {
    name: 'LeaveType',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      name: 'string',
      nameAr: { type: 'string', optional: true },
      daysPerYear: { type: 'int', default: 30 },
      isPaid: { type: 'bool', default: true },
      isCarryOver: { type: 'bool', default: false },
      maxCarryOverDays: { type: 'int', default: 0 },
      isActive: { type: 'bool', default: true },
      color: { type: 'string', optional: true },
      notes: { type: 'string', optional: true },
    },
  }
}

export type LeaveTypeEntity = LeaveType
