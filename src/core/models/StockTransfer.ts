import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const StockTransferStatus = {
  Draft: 'draft',
  Pending: 'pending',
  InTransit: 'in_transit',
  Received: 'received',
  Cancelled: 'cancelled',
} as const

export type StockTransferStatusValue =
  (typeof StockTransferStatus)[keyof typeof StockTransferStatus]

export interface StockTransferInput {
  code: string
  fromWarehouseId: string
  toWarehouseId: string
  status?: StockTransferStatusValue
  notes?: string
  expectedArrivalDate?: Date
}

export interface StockTransferUpdate {
  status?: StockTransferStatusValue
  notes?: string
  expectedArrivalDate?: Date
  actualArrivalDate?: Date
}

export class StockTransfer extends Realm.Object<StockTransfer> {
  declare _id: string
  declare code: string
  declare fromWarehouseId: string
  declare toWarehouseId: string
  declare status: StockTransferStatusValue
  declare notes: string | null
  declare expectedArrivalDate: Date | null
  declare actualArrivalDate: Date | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'StockTransfer',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      fromWarehouseId: { type: 'string', indexed: true },
      toWarehouseId: { type: 'string', indexed: true },
      status: { type: 'string', default: StockTransferStatus.Draft },
      notes: { type: 'string', optional: true },
      expectedArrivalDate: { type: 'date', optional: true },
      actualArrivalDate: { type: 'date', optional: true },
    },
  }
}

export type StockTransferEntity = StockTransfer & SoftDeletableEntityFields
