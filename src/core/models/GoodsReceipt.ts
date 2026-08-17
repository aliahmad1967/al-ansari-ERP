import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const GoodsReceiptStatus = {
  Draft: 'draft',
  Received: 'received',
  Inspected: 'inspected',
  Accepted: 'accepted',
  Rejected: 'rejected',
} as const

export type GoodsReceiptStatusValue =
  (typeof GoodsReceiptStatus)[keyof typeof GoodsReceiptStatus]

export interface GoodsReceiptInput {
  code: string
  receiptDate: Date
  purchaseOrderId: string
  supplierId: string
  warehouseId: string
  receivedByUserId?: string
  deliveryNoteNumber?: string
  notes?: string
  status?: GoodsReceiptStatusValue
}

export class GoodsReceipt extends Realm.Object<GoodsReceipt> {
  declare _id: string
  declare code: string
  declare receiptDate: Date
  declare purchaseOrderId: string
  declare supplierId: string
  declare warehouseId: string
  declare receivedByUserId: string | null
  declare deliveryNoteNumber: string | null
  declare status: GoodsReceiptStatusValue
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'GoodsReceipt',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      receiptDate: { type: 'date' },
      purchaseOrderId: { type: 'string', indexed: true },
      supplierId: { type: 'string', indexed: true },
      warehouseId: { type: 'string', indexed: true },
      receivedByUserId: { type: 'string', optional: true },
      deliveryNoteNumber: { type: 'string', optional: true },
      status: { type: 'string', default: GoodsReceiptStatus.Draft },
      notes: { type: 'string', optional: true },
    },
  }
}

export type GoodsReceiptEntity = GoodsReceipt & SoftDeletableEntityFields
