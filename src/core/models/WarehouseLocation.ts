import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export interface WarehouseLocationInput {
  warehouseId: string
  code: string
  name: string
  nameAr?: string
  aisle?: string
  rack?: string
  shelf?: string
  bin?: string
  capacity?: number
  isActive?: boolean
}

export class WarehouseLocation extends Realm.Object<WarehouseLocation> {
  declare _id: string
  declare warehouseId: string
  declare code: string
  declare name: string
  declare nameAr: string | null
  declare aisle: string | null
  declare rack: string | null
  declare shelf: string | null
  declare bin: string | null
  declare capacity: number
  declare isActive: boolean
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'WarehouseLocation',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      warehouseId: { type: 'string', indexed: true },
      code: { type: 'string', indexed: true },
      name: { type: 'string' },
      nameAr: { type: 'string', optional: true },
      aisle: { type: 'string', optional: true },
      rack: { type: 'string', optional: true },
      shelf: { type: 'string', optional: true },
      bin: { type: 'string', optional: true },
      capacity: { type: 'double', default: 0 },
      isActive: { type: 'bool', default: true },
    },
  }
}

export type WarehouseLocationEntity = WarehouseLocation & SoftDeletableEntityFields
