/**
 * Organization — the top-level ERP tenant.
 *
 * A Realm may host several organizations, each owning branches, departments,
 * users and audit activity.
 */

import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'
import { OrganizationStatus, type OrganizationStatusValue } from './OrganizationStatus'

export { OrganizationStatus, type OrganizationStatusValue } from './OrganizationStatus'

export interface OrganizationInput {
  code: string
  name: string
  nameAr?: string
  legalName?: string
  taxNumber?: string
  registrationNumber?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  currency?: string
  timezone?: string
  language?: 'ar' | 'en'
  status?: OrganizationStatusValue
  notes?: string
}

export class Organization extends Realm.Object<Organization> {
  declare _id: string
  declare code: string
  declare name: string
  declare nameAr: string | null
  declare legalName: string | null
  declare taxNumber: string | null
  declare registrationNumber: string | null
  declare address: string | null
  declare phone: string | null
  declare email: string | null
  declare website: string | null
  declare currency: string
  declare timezone: string
  declare language: 'ar' | 'en'
  declare status: OrganizationStatusValue
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'Organization',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      name: 'string',
      nameAr: { type: 'string', optional: true },
      legalName: { type: 'string', optional: true },
      taxNumber: { type: 'string', optional: true },
      registrationNumber: { type: 'string', optional: true },
      address: { type: 'string', optional: true },
      phone: { type: 'string', optional: true },
      email: { type: 'string', optional: true },
      website: { type: 'string', optional: true },
      currency: { type: 'string', default: 'SAR' },
      timezone: { type: 'string', default: 'Asia/Riyadh' },
      language: { type: 'string', default: 'ar' },
      status: { type: 'string', default: OrganizationStatus.Active },
      notes: { type: 'string', optional: true },
    },
  }
}

/** Entity shape used by repositories (persisted + soft-delete fields). */
export type OrganizationEntity = Organization & SoftDeletableEntityFields
