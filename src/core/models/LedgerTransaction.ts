import Realm from 'realm'

import { BASE_PROPERTIES } from './base'

export interface LedgerTransactionInput {
  accountId: string
  journalEntryId: string
  journalEntryLineId: string
  entryDate: Date
  debit: number
  credit: number
  balance: number
  fiscalYearId: string
  fiscalPeriodId: string
  referenceType: string
  referenceId?: string | null
  referenceNumber?: string | null
  description: string
  costCenterId?: string | null
  customerId?: string | null
  supplierId?: string | null
  currency?: string
}

export class LedgerTransaction extends Realm.Object<LedgerTransaction> {
  declare _id: string
  declare accountId: string
  declare journalEntryId: string
  declare journalEntryLineId: string
  declare entryDate: Date
  declare debit: number
  declare credit: number
  declare balance: number
  declare fiscalYearId: string
  declare fiscalPeriodId: string
  declare referenceType: string
  declare referenceId: string | null
  declare referenceNumber: string | null
  declare description: string
  declare costCenterId: string | null
  declare customerId: string | null
  declare supplierId: string | null
  declare currency: string
  declare createdAt: Date
  declare updatedAt: Date

  static schema: Realm.ObjectSchema = {
    name: 'LedgerTransaction',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      accountId: { type: 'string', indexed: true },
      journalEntryId: { type: 'string', indexed: true },
      journalEntryLineId: { type: 'string', indexed: true },
      entryDate: { type: 'date', indexed: true },
      debit: { type: 'double', default: 0 },
      credit: { type: 'double', default: 0 },
      balance: { type: 'double', default: 0 },
      fiscalYearId: { type: 'string', indexed: true },
      fiscalPeriodId: { type: 'string', indexed: true },
      referenceType: { type: 'string', indexed: true },
      referenceId: { type: 'string', optional: true, indexed: true },
      referenceNumber: { type: 'string', optional: true },
      description: { type: 'string' },
      costCenterId: { type: 'string', optional: true, indexed: true },
      customerId: { type: 'string', optional: true, indexed: true },
      supplierId: { type: 'string', optional: true, indexed: true },
      currency: { type: 'string', default: 'SAR' },
    },
  }
}

export type LedgerTransactionEntity = LedgerTransaction
