import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const QuotationStatus = {
  Draft: 'draft',
  Sent: 'sent',
  Accepted: 'accepted',
  Rejected: 'rejected',
  Expired: 'expired',
  Converted: 'converted',
  Cancelled: 'cancelled',
} as const

export type QuotationStatusValue = (typeof QuotationStatus)[keyof typeof QuotationStatus]

export interface QuotationInput {
  code: string
  quotationDate: Date
  validUntilDate: Date
  customerId: string
  salesOrderId?: string
  referenceNumber?: string
  totalAmount?: number
  taxAmount?: number
  discountAmount?: number
  netAmount?: number
  currency?: string
  notes?: string
  status?: QuotationStatusValue
}

export class Quotation extends Realm.Object<Quotation> {
  declare _id: string
  declare code: string
  declare quotationDate: Date
  declare validUntilDate: Date
  declare customerId: string
  declare salesOrderId: string | null
  declare referenceNumber: string | null
  declare totalAmount: number
  declare taxAmount: number
  declare discountAmount: number
  declare netAmount: number
  declare currency: string
  declare status: QuotationStatusValue
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'Quotation',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      quotationDate: { type: 'date' },
      validUntilDate: { type: 'date' },
      customerId: { type: 'string', indexed: true },
      salesOrderId: { type: 'string', optional: true },
      referenceNumber: { type: 'string', optional: true },
      totalAmount: { type: 'double', default: 0 },
      taxAmount: { type: 'double', default: 0 },
      discountAmount: { type: 'double', default: 0 },
      netAmount: { type: 'double', default: 0 },
      currency: { type: 'string', default: 'SAR' },
      status: { type: 'string', default: QuotationStatus.Draft },
      notes: { type: 'string', optional: true },
    },
  }
}

export type QuotationEntity = Quotation & SoftDeletableEntityFields
