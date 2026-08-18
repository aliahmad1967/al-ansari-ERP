import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export interface CostCenterInput {
  code: string
  name: string
  nameAr?: string | null
  description?: string | null
  descriptionAr?: string | null
  parentCostCenterId?: string | null
  isActive: boolean
}

export class CostCenter extends Realm.Object<CostCenter> {
  declare _id: string
  declare code: string
  declare name: string
  declare nameAr: string | null
  declare description: string | null
  declare descriptionAr: string | null
  declare parentCostCenterId: string | null
  declare isActive: boolean
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'CostCenter',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      name: { type: 'string' },
      nameAr: { type: 'string', optional: true },
      description: { type: 'string', optional: true },
      descriptionAr: { type: 'string', optional: true },
      parentCostCenterId: { type: 'string', optional: true, indexed: true },
      isActive: { type: 'bool', default: true },
    },
  }
}

export type CostCenterEntity = CostCenter & SoftDeletableEntityFields
