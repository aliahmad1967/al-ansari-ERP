import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const SalesReturnStatus = {
  Draft: 'draft',
  Received: 'received',
  Inspected: 'inspected',
  Approved: 'approved',
  Rejected: 'rejected',
  Completed: 'completed',
  Cancelled: 'cancelled',
} as const

export type SalesReturnStatusValue = (typeof SalesReturnStatus)[keyof typeof SalesReturnStatus]

export interface SalesReturnInput {
  code: string
  returnDate: Date
  salesInvoiceId: string
  salesOrderId?: string
  customerId: string
  warehouseId: string
  reason: string
  totalAmount?: number
  taxAmount?: number
  netAmount?: number
  currency?: string
  notes?: string
  status?: SalesReturnStatusValue
}

export class SalesReturn extends Realm.Object<SalesReturn> {
  declare _id: string
  declare code: string
  declare returnDate: Date
  declare salesInvoiceId: string
  declare salesOrderId: string | null
  declare customerId: string
  declare warehouseId: string
  declare reason: string
  declare totalAmount: number
  declare taxAmount: number
  declare netAmount: number
  declare currency: string
  declare status: SalesReturnStatusValue
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'SalesReturn',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      returnDate: { type: 'date' },
      salesInvoiceId: { type: 'string', indexed: true },
      salesOrderId: { type: 'string', optional: true },
      customerId: { type: 'string', indexed: true },
      warehouseId: { type: 'string', indexed: true },
      reason: { type: 'string' },
      totalAmount: { type: 'double', default: 0 },
      taxAmount: { type: 'double', default: 0 },
      netAmount: { type: 'double', default: 0 },
      currency: { type: 'string', default: 'SAR' },
      status: { type: 'string', default: SalesReturnStatus.Draft },
      notes: { type: 'string', optional: true },
    },
  }
}

export type SalesReturnEntity = SalesReturn & SoftDeletableEntityFields
