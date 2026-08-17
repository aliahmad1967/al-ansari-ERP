import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const WarehouseStatus = {
  Active: 'active',
  Inactive: 'inactive',
} as const

export type WarehouseStatusValue = (typeof WarehouseStatus)[keyof typeof WarehouseStatus]

export interface WarehouseInput {
  code: string
  name: string
  nameAr?: string
  address?: string
  addressAr?: string
  managerUserId?: string
  capacity?: number
  capacityUnit?: string
  status?: WarehouseStatusValue
  isActive?: boolean
}

export class Warehouse extends Realm.Object<Warehouse> {
  declare _id: string
  declare code: string
  declare name: string
  declare nameAr: string | null
  declare address: string | null
  declare addressAr: string | null
  declare managerUserId: string | null
  declare capacity: number
  declare capacityUnit: string | null
  declare status: WarehouseStatusValue
  declare isActive: boolean
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'Warehouse',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      name: { type: 'string' },
      nameAr: { type: 'string', optional: true },
      address: { type: 'string', optional: true },
      addressAr: { type: 'string', optional: true },
      managerUserId: { type: 'string', optional: true },
      capacity: { type: 'double', default: 0 },
      capacityUnit: { type: 'string', optional: true },
      status: { type: 'string', default: WarehouseStatus.Active },
      isActive: { type: 'bool', default: true },
    },
  }
}

export type WarehouseEntity = Warehouse & SoftDeletableEntityFields
