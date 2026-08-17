import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const PayrollPeriodStatus = {
  Draft: 'draft',
  Open: 'open',
  Closed: 'closed',
} as const

export type PayrollPeriodStatusValue = (typeof PayrollPeriodStatus)[keyof typeof PayrollPeriodStatus]

export interface PayrollPeriodInput {
  name: string
  nameAr?: string
  startDate: Date
  endDate: Date
  year: number
  month: number
  status?: PayrollPeriodStatusValue
}

export class PayrollPeriod extends Realm.Object<PayrollPeriod> {
  declare _id: string
  declare name: string
  declare nameAr: string | null
  declare startDate: Date
  declare endDate: Date
  declare year: number
  declare month: number
  declare status: PayrollPeriodStatusValue
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'PayrollPeriod',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      name: 'string',
      nameAr: { type: 'string', optional: true },
      startDate: { type: 'date' },
      endDate: { type: 'date' },
      year: { type: 'int' },
      month: { type: 'int' },
      status: { type: 'string', default: PayrollPeriodStatus.Draft },
    },
  }
}

export type PayrollPeriodEntity = PayrollPeriod & SoftDeletableEntityFields
