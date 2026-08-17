import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const SupplierPaymentStatus = {
  Draft: 'draft',
  Completed: 'completed',
  Cancelled: 'cancelled',
} as const

export type SupplierPaymentStatusValue =
  (typeof SupplierPaymentStatus)[keyof typeof SupplierPaymentStatus]

export const SupplierPaymentMethod = {
  Cash: 'cash',
  BankTransfer: 'bank_transfer',
  Check: 'check',
} as const

export type SupplierPaymentMethodValue =
  (typeof SupplierPaymentMethod)[keyof typeof SupplierPaymentMethod]

export interface SupplierPaymentInput {
  code: string
  paymentDate: Date
  supplierInvoiceId: string
  supplierId: string
  amount: number
  paymentMethod: SupplierPaymentMethodValue
  referenceNumber?: string
  notes?: string
  status?: SupplierPaymentStatusValue
}

export class SupplierPayment extends Realm.Object<SupplierPayment> {
  declare _id: string
  declare code: string
  declare paymentDate: Date
  declare supplierInvoiceId: string
  declare supplierId: string
  declare amount: number
  declare paymentMethod: SupplierPaymentMethodValue
  declare referenceNumber: string | null
  declare status: SupplierPaymentStatusValue
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'SupplierPayment',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      paymentDate: { type: 'date' },
      supplierInvoiceId: { type: 'string', indexed: true },
      supplierId: { type: 'string', indexed: true },
      amount: { type: 'double' },
      paymentMethod: { type: 'string' },
      referenceNumber: { type: 'string', optional: true },
      status: { type: 'string', default: SupplierPaymentStatus.Draft },
      notes: { type: 'string', optional: true },
    },
  }
}

export type SupplierPaymentEntity = SupplierPayment & SoftDeletableEntityFields
