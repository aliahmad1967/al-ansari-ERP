import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export interface SalesInvoiceItemInput {
  salesInvoiceId: string
  salesOrderItemId?: string
  deliveryItemId?: string
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

export class SalesInvoiceItem extends Realm.Object<SalesInvoiceItem> {
  declare _id: string
  declare salesInvoiceId: string
  declare salesOrderItemId: string | null
  declare deliveryItemId: string | null
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
    name: 'SalesInvoiceItem',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      salesInvoiceId: { type: 'string', indexed: true },
      salesOrderItemId: { type: 'string', optional: true },
      deliveryItemId: { type: 'string', optional: true },
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

export type SalesInvoiceItemEntity = SalesInvoiceItem & SoftDeletableEntityFields
