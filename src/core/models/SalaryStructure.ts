import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export interface SalaryStructureInput {
  code: string
  name: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  isDefault?: boolean
  isActive?: boolean
}

export class SalaryStructure extends Realm.Object<SalaryStructure> {
  declare _id: string
  declare code: string
  declare name: string
  declare nameAr: string | null
  declare description: string | null
  declare descriptionAr: string | null
  declare isDefault: boolean
  declare isActive: boolean
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'SalaryStructure',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      name: 'string',
      nameAr: { type: 'string', optional: true },
      description: { type: 'string', optional: true },
      descriptionAr: { type: 'string', optional: true },
      isDefault: { type: 'bool', default: false },
      isActive: { type: 'bool', default: true },
    },
  }
}

export type SalaryStructureEntity = SalaryStructure & SoftDeletableEntityFields
