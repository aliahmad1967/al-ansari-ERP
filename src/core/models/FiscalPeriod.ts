import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const FiscalPeriodStatus = {
  Draft: 'draft',
  Open: 'open',
  Closed: 'closed',
} as const

export type FiscalPeriodStatusValue = (typeof FiscalPeriodStatus)[keyof typeof FiscalPeriodStatus]

export interface FiscalPeriodInput {
  fiscalYearId: string
  code: string
  name: string
  nameAr?: string | null
  startDate: Date
  endDate: Date
  status?: FiscalPeriodStatusValue
}

export class FiscalPeriod extends Realm.Object<FiscalPeriod> {
  declare _id: string
  declare fiscalYearId: string
  declare code: string
  declare name: string
  declare nameAr: string | null
  declare startDate: Date
  declare endDate: Date
  declare status: FiscalPeriodStatusValue
  declare isClosed: boolean
  declare closedAt: Date | null
  declare closedByUserId: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'FiscalPeriod',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      fiscalYearId: { type: 'string', indexed: true },
      code: { type: 'string', indexed: true },
      name: { type: 'string' },
      nameAr: { type: 'string', optional: true },
      startDate: { type: 'date' },
      endDate: { type: 'date' },
      status: { type: 'string', default: FiscalPeriodStatus.Draft },
      isClosed: { type: 'bool', default: false },
      closedAt: { type: 'date', optional: true },
      closedByUserId: { type: 'string', optional: true },
    },
  }
}

export type FiscalPeriodEntity = FiscalPeriod & SoftDeletableEntityFields
