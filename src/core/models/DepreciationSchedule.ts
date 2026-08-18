import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const DepreciationScheduleStatus = {
  Draft: 'draft',
  Finalized: 'finalized',
  Reversed: 'reversed',
} as const

export type DepreciationScheduleStatusValue =
  (typeof DepreciationScheduleStatus)[keyof typeof DepreciationScheduleStatus]

export interface DepreciationScheduleInput {
  assetId: string
  periodStart: Date
  periodEnd: Date
  depreciationAmount: number
  accumulatedDepreciation: number
  bookValue: number
  status?: DepreciationScheduleStatusValue
  journalEntryId?: string | null
  finalizedAt?: Date | null
  finalizedByUserId?: string | null
}

export class DepreciationSchedule extends Realm.Object<DepreciationSchedule> {
  declare _id: string
  declare assetId: string
  declare periodStart: Date
  declare periodEnd: Date
  declare depreciationAmount: number
  declare accumulatedDepreciation: number
  declare bookValue: number
  declare status: DepreciationScheduleStatusValue
  declare journalEntryId: string | null
  declare finalizedAt: Date | null
  declare finalizedByUserId: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'DepreciationSchedule',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      assetId: { type: 'string', indexed: true },
      periodStart: { type: 'date' },
      periodEnd: { type: 'date' },
      depreciationAmount: { type: 'double', default: 0 },
      accumulatedDepreciation: { type: 'double', default: 0 },
      bookValue: { type: 'double', default: 0 },
      status: { type: 'string', default: DepreciationScheduleStatus.Draft },
      journalEntryId: { type: 'string', optional: true },
      finalizedAt: { type: 'date', optional: true },
      finalizedByUserId: { type: 'string', optional: true },
    },
  }
}

export type DepreciationScheduleEntity = DepreciationSchedule & SoftDeletableEntityFields
