/**
 * Branch — a physical or logical branch of an {@link Organization}.
 */

import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'
import type { Organization } from './Organization'

export const BranchStatus = {
  Active: 'active',
  Inactive: 'inactive',
} as const

export type BranchStatusValue = (typeof BranchStatus)[keyof typeof BranchStatus]

export interface BranchInput {
  code: string
  name: string
  nameAr?: string
  organization: Organization
  city?: string
  address?: string
  phone?: string
  email?: string
  status?: BranchStatusValue
  notes?: string
}

export class Branch extends Realm.Object<Branch> {
  declare _id: string
  declare code: string
  declare name: string
  declare nameAr: string | null
  declare organization: Organization
  declare city: string | null
  declare address: string | null
  declare phone: string | null
  declare email: string | null
  declare status: BranchStatusValue
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  /** Convenience accessor: the owning organization's primary key. */
  get organizationId(): string | null {
    return this.organization?._id ?? null
  }

  static schema: Realm.ObjectSchema = {
    name: 'Branch',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      name: 'string',
      nameAr: { type: 'string', optional: true },
      organization: { type: 'object', objectType: 'Organization', optional: true },
      city: { type: 'string', optional: true },
      address: { type: 'string', optional: true },
      phone: { type: 'string', optional: true },
      email: { type: 'string', optional: true },
      status: { type: 'string', default: BranchStatus.Active },
      notes: { type: 'string', optional: true },
    },
  }
}

/** Entity shape used by repositories (persisted + soft-delete fields). */
export type BranchEntity = Branch & SoftDeletableEntityFields
