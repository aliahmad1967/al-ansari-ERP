import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const StockAdjustmentStatus = {
  Draft: 'draft',
  Pending: 'pending',
  Approved: 'approved',
  Applied: 'applied',
  Cancelled: 'cancelled',
} as const

export type StockAdjustmentStatusValue =
  (typeof StockAdjustmentStatus)[keyof typeof StockAdjustmentStatus]

export interface StockAdjustmentInput {
  code: string
  warehouseId: string
  reason: string
  notes?: string
}

export interface StockAdjustmentUpdate {
  status?: StockAdjustmentStatusValue
  notes?: string
}

export class StockAdjustment extends Realm.Object<StockAdjustment> {
  declare _id: string
  declare code: string
  declare warehouseId: string
  declare reason: string
  declare status: StockAdjustmentStatusValue
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'StockAdjustment',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      warehouseId: { type: 'string', indexed: true },
      reason: { type: 'string' },
      status: { type: 'string', default: StockAdjustmentStatus.Draft },
      notes: { type: 'string', optional: true },
    },
  }
}

export type StockAdjustmentEntity = StockAdjustment & SoftDeletableEntityFields
