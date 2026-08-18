import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export interface AssetCategoryInput {
  code: string
  name: string
  nameAr: string
  defaultUsefulLifeMonths?: number
  defaultDepreciationMethod?: string
  expenseAccountId?: string | null
  accumulatedDepreciationAccountId?: string | null
}

export class AssetCategory extends Realm.Object<AssetCategory> {
  declare _id: string
  declare code: string
  declare name: string
  declare nameAr: string
  declare defaultUsefulLifeMonths: number
  declare defaultDepreciationMethod: string
  declare expenseAccountId: string | null
  declare accumulatedDepreciationAccountId: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'AssetCategory',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      name: { type: 'string' },
      nameAr: { type: 'string' },
      defaultUsefulLifeMonths: { type: 'int', default: 60 },
      defaultDepreciationMethod: { type: 'string', default: 'straight_line' },
      expenseAccountId: { type: 'string', optional: true },
      accumulatedDepreciationAccountId: { type: 'string', optional: true },
    },
  }
}

export type AssetCategoryEntity = AssetCategory & SoftDeletableEntityFields
