import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const AssetStatus = {
  Active: 'active',
  Inactive: 'inactive',
  Disposed: 'disposed',
  Transferred: 'transferred',
  UnderMaintenance: 'under_maintenance',
} as const

export type AssetStatusValue = (typeof AssetStatus)[keyof typeof AssetStatus]

export const DepreciationMethod = {
  StraightLine: 'straight_line',
  DecliningBalance: 'declining_balance',
  SumOfYearsDigits: 'sum_of_years_digits',
  UnitsOfProduction: 'units_of_production',
} as const

export type DepreciationMethodValue = (typeof DepreciationMethod)[keyof typeof DepreciationMethod]

export interface AssetInput {
  code: string
  name: string
  nameAr: string
  description?: string | null
  categoryId: string
  locationId?: string | null
  custodianId?: string | null
  purchaseValue: number
  salvageValue?: number
  usefulLifeMonths: number
  depreciationMethod?: DepreciationMethodValue
  acquisitionDate: Date
  disposalDate?: Date | null
  status?: AssetStatusValue
  serialNumber?: string | null
  model?: string | null
  manufacturer?: string | null
  journalEntryId?: string | null
  lastDepreciationDate?: Date | null
}

export class Asset extends Realm.Object<Asset> {
  declare _id: string
  declare code: string
  declare name: string
  declare nameAr: string
  declare description: string | null
  declare categoryId: string
  declare locationId: string | null
  declare custodianId: string | null
  declare purchaseValue: number
  declare salvageValue: number
  declare usefulLifeMonths: number
  declare depreciationMethod: DepreciationMethodValue
  declare acquisitionDate: Date
  declare disposalDate: Date | null
  declare status: AssetStatusValue
  declare serialNumber: string | null
  declare model: string | null
  declare manufacturer: string | null
  declare journalEntryId: string | null
  declare lastDepreciationDate: Date | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'Asset',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      name: { type: 'string' },
      nameAr: { type: 'string' },
      description: { type: 'string', optional: true },
      categoryId: { type: 'string', indexed: true },
      locationId: { type: 'string', optional: true, indexed: true },
      custodianId: { type: 'string', optional: true, indexed: true },
      purchaseValue: { type: 'double', default: 0 },
      salvageValue: { type: 'double', default: 0 },
      usefulLifeMonths: { type: 'int' },
      depreciationMethod: { type: 'string', default: DepreciationMethod.StraightLine },
      acquisitionDate: { type: 'date', indexed: true },
      disposalDate: { type: 'date', optional: true },
      status: { type: 'string', default: AssetStatus.Active },
      serialNumber: { type: 'string', optional: true },
      model: { type: 'string', optional: true },
      manufacturer: { type: 'string', optional: true },
      journalEntryId: { type: 'string', optional: true },
      lastDepreciationDate: { type: 'date', optional: true },
    },
  }
}

export type AssetEntity = Asset & SoftDeletableEntityFields
