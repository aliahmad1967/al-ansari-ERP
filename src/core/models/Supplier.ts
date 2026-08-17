import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const SupplierStatus = {
  Active: 'active',
  Inactive: 'inactive',
  Blacklisted: 'blacklisted',
} as const

export type SupplierStatusValue = (typeof SupplierStatus)[keyof typeof SupplierStatus]

export interface SupplierInput {
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
  taxNumber?: string
  paymentTerms?: string
  currency?: string
  rating?: number
  notes?: string
  status?: SupplierStatusValue
  isActive?: boolean
}

export class Supplier extends Realm.Object<Supplier> {
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
  declare taxNumber: string | null
  declare paymentTerms: string | null
  declare currency: string
  declare rating: number
  declare notes: string | null
  declare status: SupplierStatusValue
  declare isActive: boolean
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'Supplier',
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
      taxNumber: { type: 'string', optional: true },
      paymentTerms: { type: 'string', optional: true },
      currency: { type: 'string', default: 'SAR' },
      rating: { type: 'double', default: 0 },
      notes: { type: 'string', optional: true },
      status: { type: 'string', default: SupplierStatus.Active },
      isActive: { type: 'bool', default: true },
    },
  }
}

export type SupplierEntity = Supplier & SoftDeletableEntityFields
