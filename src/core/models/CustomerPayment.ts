import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const CustomerPaymentStatus = {
  Draft: 'draft',
  Completed: 'completed',
  Cancelled: 'cancelled',
} as const

export type CustomerPaymentStatusValue =
  (typeof CustomerPaymentStatus)[keyof typeof CustomerPaymentStatus]

export const CustomerPaymentMethod = {
  Cash: 'cash',
  BankTransfer: 'bank_transfer',
  Check: 'check',
  CreditCard: 'credit_card',
} as const

export type CustomerPaymentMethodValue =
  (typeof CustomerPaymentMethod)[keyof typeof CustomerPaymentMethod]

export interface CustomerPaymentInput {
  code: string
  paymentDate: Date
  salesInvoiceId: string
  customerId: string
  amount: number
  paymentMethod: CustomerPaymentMethodValue
  referenceNumber?: string
  notes?: string
  status?: CustomerPaymentStatusValue
}

export class CustomerPayment extends Realm.Object<CustomerPayment> {
  declare _id: string
  declare code: string
  declare paymentDate: Date
  declare salesInvoiceId: string
  declare customerId: string
  declare amount: number
  declare paymentMethod: CustomerPaymentMethodValue
  declare referenceNumber: string | null
  declare status: CustomerPaymentStatusValue
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'CustomerPayment',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      paymentDate: { type: 'date' },
      salesInvoiceId: { type: 'string', indexed: true },
      customerId: { type: 'string', indexed: true },
      amount: { type: 'double' },
      paymentMethod: { type: 'string' },
      referenceNumber: { type: 'string', optional: true },
      status: { type: 'string', default: CustomerPaymentStatus.Draft },
      notes: { type: 'string', optional: true },
    },
  }
}

export type CustomerPaymentEntity = CustomerPayment & SoftDeletableEntityFields
