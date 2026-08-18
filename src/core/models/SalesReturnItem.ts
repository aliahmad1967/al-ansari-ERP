import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export interface SalesReturnItemInput {
  salesReturnId: string
  salesInvoiceItemId: string
  productId: string
  quantityReturned: number
  unitPrice?: number
  taxRate?: number
  taxAmount?: number
  totalAmount?: number
  reason?: string
  notes?: string
}

export class SalesReturnItem extends Realm.Object<SalesReturnItem> {
  declare _id: string
  declare salesReturnId: string
  declare salesInvoiceItemId: string
  declare productId: string
  declare quantityReturned: number
  declare unitPrice: number
  declare taxRate: number
  declare taxAmount: number
  declare totalAmount: number
  declare reason: string | null
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'SalesReturnItem',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      salesReturnId: { type: 'string', indexed: true },
      salesInvoiceItemId: { type: 'string' },
      productId: { type: 'string', indexed: true },
      quantityReturned: { type: 'double' },
      unitPrice: { type: 'double', default: 0 },
      taxRate: { type: 'double', default: 0 },
      taxAmount: { type: 'double', default: 0 },
      totalAmount: { type: 'double', default: 0 },
      reason: { type: 'string', optional: true },
      notes: { type: 'string', optional: true },
    },
  }
}

export type SalesReturnItemEntity = SalesReturnItem & SoftDeletableEntityFields
