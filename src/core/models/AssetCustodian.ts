import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export interface AssetCustodianInput {
  name: string
  nameAr: string
  departmentId?: string | null
  email?: string | null
  phone?: string | null
}

export class AssetCustodian extends Realm.Object<AssetCustodian> {
  declare _id: string
  declare name: string
  declare nameAr: string
  declare departmentId: string | null
  declare email: string | null
  declare phone: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'AssetCustodian',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      name: { type: 'string' },
      nameAr: { type: 'string' },
      departmentId: { type: 'string', optional: true, indexed: true },
      email: { type: 'string', optional: true },
      phone: { type: 'string', optional: true },
    },
  }
}

export type AssetCustodianEntity = AssetCustodian & SoftDeletableEntityFields
