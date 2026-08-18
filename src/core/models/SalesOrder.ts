import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const SalesOrderStatus = {
  Draft: 'draft',
  Confirmed: 'confirmed',
  PartiallyDelivered: 'partially_delivered',
  Delivered: 'delivered',
  PartiallyInvoiced: 'partially_invoiced',
  Invoiced: 'invoiced',
  Completed: 'completed',
  Cancelled: 'cancelled',
} as const

export type SalesOrderStatusValue = (typeof SalesOrderStatus)[keyof typeof SalesOrderStatus]

export interface SalesOrderInput {
  code: string
  orderDate: Date
  customerId: string
  quotationId?: string
  expectedDeliveryDate?: Date
  referenceNumber?: string
  totalAmount?: number
  taxAmount?: number
  discountAmount?: number
  netAmount?: number
  currency?: string
  notes?: string
  status?: SalesOrderStatusValue
}

export class SalesOrder extends Realm.Object<SalesOrder> {
  declare _id: string
  declare code: string
  declare orderDate: Date
  declare customerId: string
  declare quotationId: string | null
  declare expectedDeliveryDate: Date | null
  declare referenceNumber: string | null
  declare totalAmount: number
  declare taxAmount: number
  declare discountAmount: number
  declare netAmount: number
  declare currency: string
  declare status: SalesOrderStatusValue
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'SalesOrder',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      orderDate: { type: 'date' },
      customerId: { type: 'string', indexed: true },
      quotationId: { type: 'string', optional: true },
      expectedDeliveryDate: { type: 'date', optional: true },
      referenceNumber: { type: 'string', optional: true },
      totalAmount: { type: 'double', default: 0 },
      taxAmount: { type: 'double', default: 0 },
      discountAmount: { type: 'double', default: 0 },
      netAmount: { type: 'double', default: 0 },
      currency: { type: 'string', default: 'SAR' },
      status: { type: 'string', default: SalesOrderStatus.Draft },
      notes: { type: 'string', optional: true },
    },
  }
}

export type SalesOrderEntity = SalesOrder & SoftDeletableEntityFields
