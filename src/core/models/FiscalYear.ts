import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const FiscalYearStatus = {
  Draft: 'draft',
  Open: 'open',
  Closed: 'closed',
} as const

export type FiscalYearStatusValue = (typeof FiscalYearStatus)[keyof typeof FiscalYearStatus]

export interface FiscalYearInput {
  code: string
  name: string
  nameAr?: string | null
  startDate: Date
  endDate: Date
  status?: FiscalYearStatusValue
  isClosed?: boolean
  closedAt?: Date
  closedByUserId?: string | null
  notes?: string | null
}

export class FiscalYear extends Realm.Object<FiscalYear> {
  declare _id: string
  declare code: string
  declare name: string
  declare nameAr: string | null
  declare startDate: Date
  declare endDate: Date
  declare status: FiscalYearStatusValue
  declare isClosed: boolean
  declare closedAt: Date | null
  declare closedByUserId: string | null
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'FiscalYear',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      name: { type: 'string' },
      nameAr: { type: 'string', optional: true },
      startDate: { type: 'date' },
      endDate: { type: 'date' },
      status: { type: 'string', default: FiscalYearStatus.Draft },
      isClosed: { type: 'bool', default: false },
      closedAt: { type: 'date', optional: true },
      closedByUserId: { type: 'string', optional: true },
      notes: { type: 'string', optional: true },
    },
  }
}

export type FiscalYearEntity = FiscalYear & SoftDeletableEntityFields
