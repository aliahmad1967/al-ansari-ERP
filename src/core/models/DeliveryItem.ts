import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export interface DeliveryItemInput {
  deliveryId: string
  salesOrderItemId: string
  productId: string
  quantityShipped: number
  batchNumber?: string
  expiryDate?: Date
  notes?: string
}

export class DeliveryItem extends Realm.Object<DeliveryItem> {
  declare _id: string
  declare deliveryId: string
  declare salesOrderItemId: string
  declare productId: string
  declare quantityShipped: number
  declare batchNumber: string | null
  declare expiryDate: Date | null
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'DeliveryItem',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      deliveryId: { type: 'string', indexed: true },
      salesOrderItemId: { type: 'string' },
      productId: { type: 'string', indexed: true },
      quantityShipped: { type: 'double' },
      batchNumber: { type: 'string', optional: true },
      expiryDate: { type: 'date', optional: true },
      notes: { type: 'string', optional: true },
    },
  }
}

export type DeliveryItemEntity = DeliveryItem & SoftDeletableEntityFields
