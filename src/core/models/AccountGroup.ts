import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'
import { type AccountTypeValue } from './Account'

export interface AccountGroupInput {
  code: string
  name: string
  nameAr?: string
  type: AccountTypeValue
  sortOrder: number
  isActive: boolean
  description?: string
  descriptionAr?: string
}

export class AccountGroup extends Realm.Object<AccountGroup> {
  declare _id: string
  declare code: string
  declare name: string
  declare nameAr: string | null
  declare type: AccountTypeValue
  declare sortOrder: number
  declare isActive: boolean
  declare description: string | null
  declare descriptionAr: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'AccountGroup',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      name: { type: 'string' },
      nameAr: { type: 'string', optional: true },
      type: { type: 'string', indexed: true },
      sortOrder: { type: 'int', default: 0 },
      isActive: { type: 'bool', default: true },
      description: { type: 'string', optional: true },
      descriptionAr: { type: 'string', optional: true },
    },
  }
}

export type AccountGroupEntity = AccountGroup & SoftDeletableEntityFields
