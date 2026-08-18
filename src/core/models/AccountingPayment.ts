import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const AccountingPaymentStatus = {
  Draft: 'draft',
  Approved: 'approved',
  Posted: 'posted',
  Cancelled: 'cancelled',
} as const

export type AccountingPaymentStatusValue = (typeof AccountingPaymentStatus)[keyof typeof AccountingPaymentStatus]

export const AccountingPaymentMethod = {
  Cash: 'cash',
  BankTransfer: 'bank_transfer',
  Check: 'check',
  CreditCard: 'credit_card',
  OnlinePayment: 'online_payment',
} as const

export type AccountingPaymentMethodValue = (typeof AccountingPaymentMethod)[keyof typeof AccountingPaymentMethod]

export interface AccountingPaymentInput {
  code: string
  paymentDate: Date
  accountId: string
  costCenterId?: string
  referenceType?: string
  referenceId?: string
  referenceNumber?: string
  payeeName: string
  payeeNameAr?: string
  amount: number
  currency?: string
  paymentMethod: AccountingPaymentMethodValue
  chequeNumber?: string
  chequeDate?: Date
  bankName?: string
  bankAccountNumber?: string
  description: string
  notes?: string
  status?: AccountingPaymentStatusValue
  journalEntryId?: string
  postedAt?: Date
  postedByUserId?: string
  approvedAt?: Date
  approvedByUserId?: string | null
  createdByUserId?: string
}

export class AccountingPayment extends Realm.Object<AccountingPayment> {
  declare _id: string
  declare code: string
  declare paymentDate: Date
  declare accountId: string
  declare costCenterId: string | null
  declare referenceType: string | null
  declare referenceId: string | null
  declare referenceNumber: string | null
  declare payeeName: string
  declare payeeNameAr: string | null
  declare amount: number
  declare currency: string
  declare paymentMethod: AccountingPaymentMethodValue
  declare chequeNumber: string | null
  declare chequeDate: Date | null
  declare bankName: string | null
  declare bankAccountNumber: string | null
  declare description: string
  declare notes: string | null
  declare status: AccountingPaymentStatusValue
  declare journalEntryId: string | null
  declare postedAt: Date | null
  declare postedByUserId: string | null
  declare approvedAt: Date | null
  declare approvedByUserId: string | null
  declare createdByUserId: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'AccountingPayment',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      paymentDate: { type: 'date', indexed: true },
      accountId: { type: 'string', indexed: true },
      costCenterId: { type: 'string', optional: true, indexed: true },
      referenceType: { type: 'string', optional: true },
      referenceId: { type: 'string', optional: true, indexed: true },
      referenceNumber: { type: 'string', optional: true },
      payeeName: { type: 'string' },
      payeeNameAr: { type: 'string', optional: true },
      amount: { type: 'double' },
      currency: { type: 'string', default: 'SAR' },
      paymentMethod: { type: 'string' },
      chequeNumber: { type: 'string', optional: true },
      chequeDate: { type: 'date', optional: true },
      bankName: { type: 'string', optional: true },
      bankAccountNumber: { type: 'string', optional: true },
      description: { type: 'string' },
      notes: { type: 'string', optional: true },
      status: { type: 'string', default: AccountingPaymentStatus.Draft },
      journalEntryId: { type: 'string', optional: true, indexed: true },
      postedAt: { type: 'date', optional: true },
      postedByUserId: { type: 'string', optional: true },
      approvedAt: { type: 'date', optional: true },
      approvedByUserId: { type: 'string', optional: true },
      createdByUserId: { type: 'string', optional: true },
    },
  }
}

export type AccountingPaymentEntity = AccountingPayment & SoftDeletableEntityFields
