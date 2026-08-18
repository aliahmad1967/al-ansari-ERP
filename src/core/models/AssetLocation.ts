import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export interface AssetLocationInput {
  code: string
  name: string
  nameAr: string
  address?: string | null
  branchId?: string | null
}

export class AssetLocation extends Realm.Object<AssetLocation> {
  declare _id: string
  declare code: string
  declare name: string
  declare nameAr: string
  declare address: string | null
  declare branchId: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'AssetLocation',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      name: { type: 'string' },
      nameAr: { type: 'string' },
      address: { type: 'string', optional: true },
      branchId: { type: 'string', optional: true, indexed: true },
    },
  }
}

export type AssetLocationEntity = AssetLocation & SoftDeletableEntityFields
