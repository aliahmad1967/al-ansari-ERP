import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const InventoryCountStatus = {
  Draft: 'draft',
  InProgress: 'in_progress',
  Completed: 'completed',
  Applied: 'applied',
  Cancelled: 'cancelled',
} as const

export type InventoryCountStatusValue =
  (typeof InventoryCountStatus)[keyof typeof InventoryCountStatus]

export interface InventoryCountInput {
  code: string
  warehouseId: string
  countDate: Date
  notes?: string
}

export interface InventoryCountUpdate {
  status?: InventoryCountStatusValue
  countDate?: Date
  notes?: string
}

export class InventoryCount extends Realm.Object<InventoryCount> {
  declare _id: string
  declare code: string
  declare warehouseId: string
  declare status: InventoryCountStatusValue
  declare countDate: Date
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'InventoryCount',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      warehouseId: { type: 'string', indexed: true },
      status: { type: 'string', default: InventoryCountStatus.Draft },
      countDate: { type: 'date' },
      notes: { type: 'string', optional: true },
    },
  }
}

export type InventoryCountEntity = InventoryCount & SoftDeletableEntityFields
