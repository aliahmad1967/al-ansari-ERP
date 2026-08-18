import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const AssetMaintenanceStatus = {
  Scheduled: 'scheduled',
  InProgress: 'in_progress',
  Completed: 'completed',
  Cancelled: 'cancelled',
} as const

export type AssetMaintenanceStatusValue =
  (typeof AssetMaintenanceStatus)[keyof typeof AssetMaintenanceStatus]

export const AssetMaintenanceType = {
  Preventive: 'preventive',
  Corrective: 'corrective',
  Emergency: 'emergency',
} as const

export type AssetMaintenanceTypeValue =
  (typeof AssetMaintenanceType)[keyof typeof AssetMaintenanceType]

export interface AssetMaintenanceInput {
  assetId: string
  type?: AssetMaintenanceTypeValue
  description: string
  scheduledDate: Date
  completedDate?: Date | null
  cost?: number
  status?: AssetMaintenanceStatusValue
  vendor?: string | null
  notes?: string | null
}

export class AssetMaintenance extends Realm.Object<AssetMaintenance> {
  declare _id: string
  declare assetId: string
  declare type: AssetMaintenanceTypeValue
  declare description: string
  declare scheduledDate: Date
  declare completedDate: Date | null
  declare cost: number
  declare status: AssetMaintenanceStatusValue
  declare vendor: string | null
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'AssetMaintenance',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      assetId: { type: 'string', indexed: true },
      type: { type: 'string', default: AssetMaintenanceType.Preventive },
      description: { type: 'string' },
      scheduledDate: { type: 'date' },
      completedDate: { type: 'date', optional: true },
      cost: { type: 'double', default: 0 },
      status: { type: 'string', default: AssetMaintenanceStatus.Scheduled },
      vendor: { type: 'string', optional: true },
      notes: { type: 'string', optional: true },
    },
  }
}

export type AssetMaintenanceEntity = AssetMaintenance & SoftDeletableEntityFields
