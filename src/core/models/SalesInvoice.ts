import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const SalesInvoiceStatus = {
  Draft: 'draft',
  Finalized: 'finalized',
  Sent: 'sent',
  PartiallyPaid: 'partially_paid',
  Paid: 'paid',
  Overdue: 'overdue',
  Cancelled: 'cancelled',
} as const

export type SalesInvoiceStatusValue = (typeof SalesInvoiceStatus)[keyof typeof SalesInvoiceStatus]

export interface SalesInvoiceInput {
  code: string
  invoiceDate: Date
  dueDate: Date
  customerId: string
  salesOrderId?: string
  deliveryId?: string
  referenceNumber?: string
  totalAmount?: number
  taxAmount?: number
  discountAmount?: number
  netAmount?: number
  paidAmount?: number
  currency?: string
  notes?: string
  status?: SalesInvoiceStatusValue
}

export class SalesInvoice extends Realm.Object<SalesInvoice> {
  declare _id: string
  declare code: string
  declare invoiceDate: Date
  declare dueDate: Date
  declare customerId: string
  declare salesOrderId: string | null
  declare deliveryId: string | null
  declare referenceNumber: string | null
  declare totalAmount: number
  declare taxAmount: number
  declare discountAmount: number
  declare netAmount: number
  declare paidAmount: number
  declare currency: string
  declare status: SalesInvoiceStatusValue
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'SalesInvoice',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      invoiceDate: { type: 'date' },
      dueDate: { type: 'date' },
      customerId: { type: 'string', indexed: true },
      salesOrderId: { type: 'string', optional: true },
      deliveryId: { type: 'string', optional: true },
      referenceNumber: { type: 'string', optional: true },
      totalAmount: { type: 'double', default: 0 },
      taxAmount: { type: 'double', default: 0 },
      discountAmount: { type: 'double', default: 0 },
      netAmount: { type: 'double', default: 0 },
      paidAmount: { type: 'double', default: 0 },
      currency: { type: 'string', default: 'SAR' },
      status: { type: 'string', default: SalesInvoiceStatus.Draft },
      notes: { type: 'string', optional: true },
    },
  }
}

export type SalesInvoiceEntity = SalesInvoice & SoftDeletableEntityFields
