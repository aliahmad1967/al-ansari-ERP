import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const AssetDisposalStatus = {
  Pending: 'pending',
  Approved: 'approved',
  Completed: 'completed',
  Rejected: 'rejected',
} as const

export type AssetDisposalStatusValue =
  (typeof AssetDisposalStatus)[keyof typeof AssetDisposalStatus]

export const AssetDisposalMethod = {
  Sale: 'sale',
  Scrapping: 'scrapping',
  Donation: 'donation',
  WriteOff: 'write_off',
} as const

export type AssetDisposalMethodValue =
  (typeof AssetDisposalMethod)[keyof typeof AssetDisposalMethod]

export interface AssetDisposalInput {
  assetId: string
  disposalDate: Date
  disposalMethod: AssetDisposalMethodValue
  disposalValue?: number
  gainLoss?: number
  reason: string
  status?: AssetDisposalStatusValue
  journalEntryId?: string | null
  approvedBy?: string | null
  approvedAt?: Date | null
}

export class AssetDisposal extends Realm.Object<AssetDisposal> {
  declare _id: string
  declare assetId: string
  declare disposalDate: Date
  declare disposalMethod: AssetDisposalMethodValue
  declare disposalValue: number
  declare gainLoss: number
  declare reason: string
  declare status: AssetDisposalStatusValue
  declare journalEntryId: string | null
  declare approvedBy: string | null
  declare approvedAt: Date | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'AssetDisposal',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      assetId: { type: 'string', indexed: true },
      disposalDate: { type: 'date' },
      disposalMethod: { type: 'string' },
      disposalValue: { type: 'double', default: 0 },
      gainLoss: { type: 'double', default: 0 },
      reason: { type: 'string' },
      status: { type: 'string', default: AssetDisposalStatus.Pending },
      journalEntryId: { type: 'string', optional: true },
      approvedBy: { type: 'string', optional: true },
      approvedAt: { type: 'date', optional: true },
    },
  }
}

export type AssetDisposalEntity = AssetDisposal & SoftDeletableEntityFields
