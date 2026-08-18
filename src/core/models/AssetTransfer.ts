import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const AssetTransferStatus = {
  Pending: 'pending',
  Approved: 'approved',
  Rejected: 'rejected',
  Completed: 'completed',
} as const

export type AssetTransferStatusValue =
  (typeof AssetTransferStatus)[keyof typeof AssetTransferStatus]

export interface AssetTransferInput {
  assetId: string
  fromLocationId?: string | null
  toLocationId?: string | null
  fromCustodianId?: string | null
  toCustodianId?: string | null
  transferDate: Date
  reason: string
  status?: AssetTransferStatusValue
  approvedBy?: string | null
  approvedAt?: Date | null
  notes?: string | null
}

export class AssetTransfer extends Realm.Object<AssetTransfer> {
  declare _id: string
  declare assetId: string
  declare fromLocationId: string | null
  declare toLocationId: string | null
  declare fromCustodianId: string | null
  declare toCustodianId: string | null
  declare transferDate: Date
  declare reason: string
  declare status: AssetTransferStatusValue
  declare approvedBy: string | null
  declare approvedAt: Date | null
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'AssetTransfer',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      assetId: { type: 'string', indexed: true },
      fromLocationId: { type: 'string', optional: true },
      toLocationId: { type: 'string', optional: true },
      fromCustodianId: { type: 'string', optional: true },
      toCustodianId: { type: 'string', optional: true },
      transferDate: { type: 'date' },
      reason: { type: 'string' },
      status: { type: 'string', default: AssetTransferStatus.Pending },
      approvedBy: { type: 'string', optional: true },
      approvedAt: { type: 'date', optional: true },
      notes: { type: 'string', optional: true },
    },
  }
}

export type AssetTransferEntity = AssetTransfer & SoftDeletableEntityFields
