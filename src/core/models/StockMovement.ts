import Realm from 'realm'

import { BASE_PROPERTIES } from './base'

export const StockMovementType = {
  Purchase: 'purchase',
  Sale: 'sale',
  TransferIn: 'transfer_in',
  TransferOut: 'transfer_out',
  AdjustmentIn: 'adjustment_in',
  AdjustmentOut: 'adjustment_out',
  ReturnIn: 'return_in',
  ReturnOut: 'return_out',
  OpeningBalance: 'opening_balance',
  Damage: 'damage',
} as const

export type StockMovementTypeValue = (typeof StockMovementType)[keyof typeof StockMovementType]

export interface StockMovementInput {
  type: StockMovementTypeValue
  productId: string
  warehouseId: string
  locationId?: string
  quantity: number
  unitCost?: number
  referenceType?: string
  referenceId?: string
  referenceNumber?: string
  batchNumber?: string
  expiryDate?: Date
  notes?: string
}

export class StockMovement extends Realm.Object<StockMovement> {
  declare _id: string
  declare type: StockMovementTypeValue
  declare productId: string
  declare warehouseId: string
  declare locationId: string | null
  declare quantity: number
  declare unitCost: number
  declare totalCost: number
  declare referenceType: string | null
  declare referenceId: string | null
  declare referenceNumber: string | null
  declare batchNumber: string | null
  declare expiryDate: Date | null
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date

  static schema: Realm.ObjectSchema = {
    name: 'StockMovement',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      type: { type: 'string' },
      productId: { type: 'string', indexed: true },
      warehouseId: { type: 'string', indexed: true },
      locationId: { type: 'string', optional: true, indexed: true },
      quantity: { type: 'double', default: 0 },
      unitCost: { type: 'double', default: 0 },
      totalCost: { type: 'double', default: 0 },
      referenceType: { type: 'string', optional: true },
      referenceId: { type: 'string', optional: true },
      referenceNumber: { type: 'string', optional: true },
      batchNumber: { type: 'string', optional: true },
      expiryDate: { type: 'date', optional: true },
      notes: { type: 'string', optional: true },
    },
  }
}

export type StockMovementEntity = StockMovement
