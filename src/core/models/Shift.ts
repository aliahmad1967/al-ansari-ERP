import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES } from './base'

export interface ShiftInput {
  name: string
  nameAr?: string
  startTime: string
  endTime: string
  breakMinutes?: number
  isActive?: boolean
  notes?: string
}

export class Shift extends Realm.Object<Shift> {
  declare _id: string
  declare name: string
  declare nameAr: string | null
  declare startTime: string
  declare endTime: string
  declare breakMinutes: number
  declare isActive: boolean
  declare notes: string | null
  declare isDeleted: boolean
  declare deletedAt: Date | null
  declare createdAt: Date
  declare updatedAt: Date

  static schema: Realm.ObjectSchema = {
    name: 'Shift',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      name: 'string',
      nameAr: { type: 'string', optional: true },
      startTime: 'string',
      endTime: 'string',
      breakMinutes: { type: 'int', default: 60 },
      isActive: { type: 'bool', default: true },
      notes: { type: 'string', optional: true },
    },
  }
}

export type ShiftEntity = Shift
