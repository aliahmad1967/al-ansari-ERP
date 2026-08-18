import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const BudgetStatus = {
  Draft: 'draft',
  Approved: 'approved',
  Active: 'active',
  Closed: 'closed',
} as const

export type BudgetStatusValue = (typeof BudgetStatus)[keyof typeof BudgetStatus]

export interface BudgetInput {
  accountId: string
  fiscalYearId: string
  fiscalPeriodId?: string | null
  amount: number
  spent: number
  notes?: string | null
  status?: BudgetStatusValue
  approvedAt?: Date
  approvedByUserId?: string | null
  createdByUserId?: string | null
}

export class Budget extends Realm.Object<Budget> {
  declare _id: string
  declare accountId: string
  declare fiscalYearId: string
  declare fiscalPeriodId: string | null
  declare amount: number
  declare spent: number
  declare notes: string | null
  declare status: BudgetStatusValue
  declare approvedAt: Date | null
  declare approvedByUserId: string | null
  declare createdByUserId: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'Budget',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      accountId: { type: 'string', indexed: true },
      fiscalYearId: { type: 'string', indexed: true },
      fiscalPeriodId: { type: 'string', optional: true, indexed: true },
      amount: { type: 'double', default: 0 },
      spent: { type: 'double', default: 0 },
      notes: { type: 'string', optional: true },
      status: { type: 'string', default: BudgetStatus.Draft },
      approvedAt: { type: 'date', optional: true },
      approvedByUserId: { type: 'string', optional: true },
      createdByUserId: { type: 'string', optional: true },
    },
  }
}

export type BudgetEntity = Budget & SoftDeletableEntityFields
