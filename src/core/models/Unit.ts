import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export interface UnitInput {
  code: string
  name: string
  nameAr?: string
  symbol?: string
  baseUnitId?: string
  conversionFactor?: number
  isActive?: boolean
}

export class Unit extends Realm.Object<Unit> {
  declare _id: string
  declare code: string
  declare name: string
  declare nameAr: string | null
  declare symbol: string | null
  declare baseUnitId: string | null
  declare conversionFactor: number
  declare isActive: boolean
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'Unit',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      name: { type: 'string' },
      nameAr: { type: 'string', optional: true },
      symbol: { type: 'string', optional: true },
      baseUnitId: { type: 'string', optional: true, indexed: true },
      conversionFactor: { type: 'double', default: 1 },
      isActive: { type: 'bool', default: true },
    },
  }
}

export type UnitEntity = Unit & SoftDeletableEntityFields
