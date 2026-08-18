import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export interface QuotationItemInput {
  quotationId: string
  productId: string
  description?: string
  quantity: number
  unitPrice?: number
  taxRate?: number
  taxAmount?: number
  discountRate?: number
  discountAmount?: number
  totalAmount?: number
  notes?: string
}

export class QuotationItem extends Realm.Object<QuotationItem> {
  declare _id: string
  declare quotationId: string
  declare productId: string
  declare description: string | null
  declare quantity: number
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
    name: 'QuotationItem',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      quotationId: { type: 'string', indexed: true },
      productId: { type: 'string', indexed: true },
      description: { type: 'string', optional: true },
      quantity: { type: 'double' },
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

export type QuotationItemEntity = QuotationItem & SoftDeletableEntityFields
