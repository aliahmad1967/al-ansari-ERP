import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export interface CategoryInput {
  code: string
  name: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  parentId?: string
  sortOrder?: number
  isActive?: boolean
}

export class Category extends Realm.Object<Category> {
  declare _id: string
  declare code: string
  declare name: string
  declare nameAr: string | null
  declare description: string | null
  declare descriptionAr: string | null
  declare parentId: string | null
  declare sortOrder: number
  declare isActive: boolean
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'Category',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      name: { type: 'string' },
      nameAr: { type: 'string', optional: true },
      description: { type: 'string', optional: true },
      descriptionAr: { type: 'string', optional: true },
      parentId: { type: 'string', optional: true, indexed: true },
      sortOrder: { type: 'int', default: 0 },
      isActive: { type: 'bool', default: true },
    },
  }
}

export type CategoryEntity = Category & SoftDeletableEntityFields
