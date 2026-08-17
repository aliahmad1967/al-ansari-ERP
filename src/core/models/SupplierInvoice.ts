import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const SupplierInvoiceStatus = {
  Draft: 'draft',
  Registered: 'registered',
  Validated: 'validated',
  PartiallyPaid: 'partially_paid',
  Paid: 'paid',
  Overdue: 'overdue',
} as const

export type SupplierInvoiceStatusValue =
  (typeof SupplierInvoiceStatus)[keyof typeof SupplierInvoiceStatus]

export interface SupplierInvoiceInput {
  code: string
  invoiceDate: Date
  supplierId: string
  purchaseOrderId: string
  goodsReceiptId?: string
  invoiceNumber: string
  totalAmount: number
  taxAmount?: number
  discountAmount?: number
  netAmount: number
  dueDate: Date
  notes?: string
  status?: SupplierInvoiceStatusValue
}

export interface SupplierInvoiceUpdate {
  code?: string
  invoiceDate?: Date
  supplierId?: string
  purchaseOrderId?: string
  goodsReceiptId?: string
  invoiceNumber?: string
  totalAmount?: number
  taxAmount?: number
  discountAmount?: number
  netAmount?: number
  dueDate?: Date
  notes?: string
  status?: SupplierInvoiceStatusValue
  paidAmount?: number
}

export class SupplierInvoice extends Realm.Object<SupplierInvoice> {
  declare _id: string
  declare code: string
  declare invoiceDate: Date
  declare supplierId: string
  declare purchaseOrderId: string
  declare goodsReceiptId: string | null
  declare invoiceNumber: string
  declare totalAmount: number
  declare taxAmount: number
  declare discountAmount: number
  declare netAmount: number
  declare dueDate: Date
  declare status: SupplierInvoiceStatusValue
  declare paidAmount: number
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'SupplierInvoice',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      invoiceDate: { type: 'date' },
      supplierId: { type: 'string', indexed: true },
      purchaseOrderId: { type: 'string' },
      goodsReceiptId: { type: 'string', optional: true },
      invoiceNumber: { type: 'string' },
      totalAmount: { type: 'double', default: 0 },
      taxAmount: { type: 'double', default: 0 },
      discountAmount: { type: 'double', default: 0 },
      netAmount: { type: 'double', default: 0 },
      dueDate: { type: 'date' },
      status: { type: 'string', default: SupplierInvoiceStatus.Draft },
      paidAmount: { type: 'double', default: 0 },
      notes: { type: 'string', optional: true },
    },
  }
}

export type SupplierInvoiceEntity = SupplierInvoice & SoftDeletableEntityFields
