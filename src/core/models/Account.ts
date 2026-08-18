import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const AccountType = {
  Asset: 'asset',
  Liability: 'liability',
  Equity: 'equity',
  Revenue: 'revenue',
  Expense: 'expense',
} as const

export type AccountTypeValue = (typeof AccountType)[keyof typeof AccountType]

export interface AccountInput {
  code: string
  name: string
  nameAr?: string
  type: AccountTypeValue
  parentAccountId?: string
  accountGroupId?: string
  level: number
  isGroup: boolean
  isActive: boolean
  currency: string
  description?: string
  descriptionAr?: string
  openingBalance: number
  currentBalance: number
  costCenterId?: string
  notes?: string
}

export class Account extends Realm.Object<Account> {
  declare _id: string
  declare code: string
  declare name: string
  declare nameAr: string | null
  declare type: AccountTypeValue
  declare parentAccountId: string | null
  declare accountGroupId: string | null
  declare level: number
  declare isGroup: boolean
  declare isActive: boolean
  declare currency: string
  declare description: string | null
  declare descriptionAr: string | null
  declare openingBalance: number
  declare currentBalance: number
  declare costCenterId: string | null
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'Account',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      name: { type: 'string' },
      nameAr: { type: 'string', optional: true },
      type: { type: 'string', indexed: true },
      parentAccountId: { type: 'string', optional: true, indexed: true },
      accountGroupId: { type: 'string', optional: true, indexed: true },
      level: { type: 'int', default: 0 },
      isGroup: { type: 'bool', default: false },
      isActive: { type: 'bool', default: true },
      currency: { type: 'string', default: 'SAR' },
      description: { type: 'string', optional: true },
      descriptionAr: { type: 'string', optional: true },
      openingBalance: { type: 'double', default: 0 },
      currentBalance: { type: 'double', default: 0 },
      costCenterId: { type: 'string', optional: true, indexed: true },
      notes: { type: 'string', optional: true },
    },
  }
}

export type AccountEntity = Account & SoftDeletableEntityFields
