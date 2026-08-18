import Realm from 'realm'

import { BASE_PROPERTIES } from './base'

export interface AccountingPolicyInput {
  key: string
  value: string
  description?: string
  descriptionAr?: string
}

export class AccountingPolicy extends Realm.Object<AccountingPolicy> {
  declare _id: string
  declare key: string
  declare value: string
  declare description: string | null
  declare descriptionAr: string | null
  declare updatedAt: Date

  static schema: Realm.ObjectSchema = {
    name: 'AccountingPolicy',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      key: { type: 'string', indexed: true },
      value: { type: 'string' },
      description: { type: 'string', optional: true },
      descriptionAr: { type: 'string', optional: true },
    },
  }
}

export type AccountingPolicyEntity = AccountingPolicy
