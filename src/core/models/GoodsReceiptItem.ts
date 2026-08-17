import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export interface GoodsReceiptItemInput {
  goodsReceiptId: string
  purchaseOrderItemId: string
  productId: string
  quantityReceived: number
  quantityAccepted?: number
  quantityRejected?: number
  rejectionReason?: string
  batchNumber?: string
  expiryDate?: Date
  notes?: string
}

export class GoodsReceiptItem extends Realm.Object<GoodsReceiptItem> {
  declare _id: string
  declare goodsReceiptId: string
  declare purchaseOrderItemId: string
  declare productId: string
  declare quantityReceived: number
  declare quantityAccepted: number
  declare quantityRejected: number
  declare rejectionReason: string | null
  declare batchNumber: string | null
  declare expiryDate: Date | null
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'GoodsReceiptItem',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      goodsReceiptId: { type: 'string', indexed: true },
      purchaseOrderItemId: { type: 'string' },
      productId: { type: 'string', indexed: true },
      quantityReceived: { type: 'double' },
      quantityAccepted: { type: 'double', default: 0 },
      quantityRejected: { type: 'double', default: 0 },
      rejectionReason: { type: 'string', optional: true },
      batchNumber: { type: 'string', optional: true },
      expiryDate: { type: 'date', optional: true },
      notes: { type: 'string', optional: true },
    },
  }
}

export type GoodsReceiptItemEntity = GoodsReceiptItem & SoftDeletableEntityFields
