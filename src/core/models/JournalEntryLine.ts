import Realm from 'realm'

import { BASE_PROPERTIES } from './base'

export interface JournalEntryLineInput {
  journalEntryId: string
  accountId: string
  debit: number
  credit: number
  currency?: string
  exchangeRate?: number
  description?: string | null
  costCenterId?: string | null
  customerId?: string | null
  supplierId?: string | null
}

export class JournalEntryLine extends Realm.Object<JournalEntryLine> {
  declare _id: string
  declare journalEntryId: string
  declare accountId: string
  declare debit: number
  declare credit: number
  declare currency: string
  declare exchangeRate: number
  declare description: string | null
  declare costCenterId: string | null
  declare customerId: string | null
  declare supplierId: string | null
  declare createdAt: Date
  declare updatedAt: Date

  static schema: Realm.ObjectSchema = {
    name: 'JournalEntryLine',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      journalEntryId: { type: 'string', indexed: true },
      accountId: { type: 'string', indexed: true },
      debit: { type: 'double', default: 0 },
      credit: { type: 'double', default: 0 },
      currency: { type: 'string', default: 'SAR' },
      exchangeRate: { type: 'double', default: 1 },
      description: { type: 'string', optional: true },
      costCenterId: { type: 'string', optional: true, indexed: true },
      customerId: { type: 'string', optional: true, indexed: true },
      supplierId: { type: 'string', optional: true, indexed: true },
    },
  }
}

export type JournalEntryLineEntity = JournalEntryLine
