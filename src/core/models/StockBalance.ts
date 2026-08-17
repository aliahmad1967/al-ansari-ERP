import Realm from 'realm'

import { BASE_PROPERTIES } from './base'

export interface StockBalanceInput {
  productId: string
  warehouseId: string
  locationId?: string
  quantity?: number
  reservedQuantity?: number
  unitCost?: number
  totalCost?: number
  lastMovementAt?: Date
}

export interface StockBalanceUpdate {
  quantity?: number
  reservedQuantity?: number
  unitCost?: number
  totalCost?: number
  lastMovementAt?: Date
}

export class StockBalance extends Realm.Object<StockBalance> {
  declare _id: string
  declare productId: string
  declare warehouseId: string
  declare locationId: string | null
  declare quantity: number
  declare reservedQuantity: number
  declare unitCost: number
  declare totalCost: number
  declare lastMovementAt: Date | null
  declare createdAt: Date
  declare updatedAt: Date

  static schema: Realm.ObjectSchema = {
    name: 'StockBalance',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      productId: { type: 'string', indexed: true },
      warehouseId: { type: 'string', indexed: true },
      locationId: { type: 'string', optional: true, indexed: true },
      quantity: { type: 'double', default: 0 },
      reservedQuantity: { type: 'double', default: 0 },
      unitCost: { type: 'double', default: 0 },
      totalCost: { type: 'double', default: 0 },
      lastMovementAt: { type: 'date', optional: true },
    },
  }
}

export type StockBalanceEntity = StockBalance
