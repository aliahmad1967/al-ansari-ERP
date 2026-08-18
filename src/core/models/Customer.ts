import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const CustomerStatus = {
  Active: 'active',
  Inactive: 'inactive',
  Suspended: 'suspended',
} as const

export type CustomerStatusValue = (typeof CustomerStatus)[keyof typeof CustomerStatus]

export interface CustomerInput {
  code: string
  name: string
  nameAr?: string
  contactPerson?: string
  contactPersonAr?: string
  email?: string
  phone?: string
  phone2?: string
  address?: string
  addressAr?: string
  city?: string
  country?: string
  taxNumber?: string
  paymentTerms?: string
  creditLimit?: number
  currency?: string
  notes?: string
  status?: CustomerStatusValue
}

export class Customer extends Realm.Object<Customer> {
  declare _id: string
  declare code: string
  declare name: string
  declare nameAr: string | null
  declare contactPerson: string | null
  declare contactPersonAr: string | null
  declare email: string | null
  declare phone: string | null
  declare phone2: string | null
  declare address: string | null
  declare addressAr: string | null
  declare city: string | null
  declare country: string | null
  declare taxNumber: string | null
  declare paymentTerms: string | null
  declare creditLimit: number
  declare currency: string
  declare balance: number
  declare notes: string | null
  declare status: CustomerStatusValue
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'Customer',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      name: { type: 'string' },
      nameAr: { type: 'string', optional: true },
      contactPerson: { type: 'string', optional: true },
      contactPersonAr: { type: 'string', optional: true },
      email: { type: 'string', optional: true },
      phone: { type: 'string', optional: true },
      phone2: { type: 'string', optional: true },
      address: { type: 'string', optional: true },
      addressAr: { type: 'string', optional: true },
      city: { type: 'string', optional: true },
      country: { type: 'string', optional: true },
      taxNumber: { type: 'string', optional: true },
      paymentTerms: { type: 'string', optional: true },
      creditLimit: { type: 'double', default: 0 },
      currency: { type: 'string', default: 'SAR' },
      balance: { type: 'double', default: 0 },
      notes: { type: 'string', optional: true },
      status: { type: 'string', default: CustomerStatus.Active },
    },
  }
}

export type CustomerEntity = Customer & SoftDeletableEntityFields
