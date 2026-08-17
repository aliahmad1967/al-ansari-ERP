import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export interface PurchaseRequestItemInput {
  purchaseRequestId: string
  productId: string
  quantity: number
  unitPrice?: number
  totalEstimatedCost?: number
  notes?: string
}

export class PurchaseRequestItem extends Realm.Object<PurchaseRequestItem> {
  declare _id: string
  declare purchaseRequestId: string
  declare productId: string
  declare quantity: number
  declare unitPrice: number
  declare totalEstimatedCost: number
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'PurchaseRequestItem',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      purchaseRequestId: { type: 'string', indexed: true },
      productId: { type: 'string', indexed: true },
      quantity: { type: 'double' },
      unitPrice: { type: 'double', default: 0 },
      totalEstimatedCost: { type: 'double', default: 0 },
      notes: { type: 'string', optional: true },
    },
  }
}

export type PurchaseRequestItemEntity = PurchaseRequestItem & SoftDeletableEntityFields
