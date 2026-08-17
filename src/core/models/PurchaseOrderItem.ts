import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export interface PurchaseOrderItemInput {
  purchaseOrderId: string
  productId: string
  quantity: number
  receivedQuantity?: number
  unitPrice?: number
  taxRate?: number
  taxAmount?: number
  discountRate?: number
  discountAmount?: number
  totalAmount?: number
  notes?: string
}

export class PurchaseOrderItem extends Realm.Object<PurchaseOrderItem> {
  declare _id: string
  declare purchaseOrderId: string
  declare productId: string
  declare quantity: number
  declare receivedQuantity: number
  declare unitPrice: number
  declare taxRate: number
  declare taxAmount: number
  declare discountRate: number
  declare discountAmount: number
  declare totalAmount: number
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'PurchaseOrderItem',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      purchaseOrderId: { type: 'string', indexed: true },
      productId: { type: 'string', indexed: true },
      quantity: { type: 'double' },
      receivedQuantity: { type: 'double', default: 0 },
      unitPrice: { type: 'double', default: 0 },
      taxRate: { type: 'double', default: 0 },
      taxAmount: { type: 'double', default: 0 },
      discountRate: { type: 'double', default: 0 },
      discountAmount: { type: 'double', default: 0 },
      totalAmount: { type: 'double', default: 0 },
      notes: { type: 'string', optional: true },
    },
  }
}

export type PurchaseOrderItemEntity = PurchaseOrderItem & SoftDeletableEntityFields
