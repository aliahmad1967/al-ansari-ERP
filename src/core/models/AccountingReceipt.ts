import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const AccountingReceiptStatus = {
  Draft: 'draft',
  Approved: 'approved',
  Posted: 'posted',
  Cancelled: 'cancelled',
} as const

export type AccountingReceiptStatusValue = (typeof AccountingReceiptStatus)[keyof typeof AccountingReceiptStatus]

export const AccountingReceiptMethod = {
  Cash: 'cash',
  BankTransfer: 'bank_transfer',
  Check: 'check',
  CreditCard: 'credit_card',
  OnlinePayment: 'online_payment',
} as const

export type AccountingReceiptMethodValue = (typeof AccountingReceiptMethod)[keyof typeof AccountingReceiptMethod]

export interface AccountingReceiptInput {
  code: string
  receiptDate: Date
  accountId: string
  costCenterId?: string
  referenceType?: string
  referenceId?: string
  referenceNumber?: string
  payerName: string
  payerNameAr?: string
  amount: number
  currency?: string
  receiptMethod: AccountingReceiptMethodValue
  chequeNumber?: string
  chequeDate?: Date
  bankName?: string
  bankAccountNumber?: string
  description: string
  notes?: string
  status?: AccountingReceiptStatusValue
  journalEntryId?: string
  postedAt?: Date
  postedByUserId?: string
  approvedAt?: Date
  approvedByUserId?: string | null
  createdByUserId?: string
}

export class AccountingReceipt extends Realm.Object<AccountingReceipt> {
  declare _id: string
  declare code: string
  declare receiptDate: Date
  declare accountId: string
  declare costCenterId: string | null
  declare referenceType: string | null
  declare referenceId: string | null
  declare referenceNumber: string | null
  declare payerName: string
  declare payerNameAr: string | null
  declare amount: number
  declare currency: string
  declare receiptMethod: AccountingReceiptMethodValue
  declare chequeNumber: string | null
  declare chequeDate: Date | null
  declare bankName: string | null
  declare bankAccountNumber: string | null
  declare description: string
  declare notes: string | null
  declare status: AccountingReceiptStatusValue
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
    name: 'AccountingReceipt',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      receiptDate: { type: 'date', indexed: true },
      accountId: { type: 'string', indexed: true },
      costCenterId: { type: 'string', optional: true, indexed: true },
      referenceType: { type: 'string', optional: true },
      referenceId: { type: 'string', optional: true, indexed: true },
      referenceNumber: { type: 'string', optional: true },
      payerName: { type: 'string' },
      payerNameAr: { type: 'string', optional: true },
      amount: { type: 'double' },
      currency: { type: 'string', default: 'SAR' },
      receiptMethod: { type: 'string' },
      chequeNumber: { type: 'string', optional: true },
      chequeDate: { type: 'date', optional: true },
      bankName: { type: 'string', optional: true },
      bankAccountNumber: { type: 'string', optional: true },
      description: { type: 'string' },
      notes: { type: 'string', optional: true },
      status: { type: 'string', default: AccountingReceiptStatus.Draft },
      journalEntryId: { type: 'string', optional: true, indexed: true },
      postedAt: { type: 'date', optional: true },
      postedByUserId: { type: 'string', optional: true },
      approvedAt: { type: 'date', optional: true },
      approvedByUserId: { type: 'string', optional: true },
      createdByUserId: { type: 'string', optional: true },
    },
  }
}

export type AccountingReceiptEntity = AccountingReceipt & SoftDeletableEntityFields
