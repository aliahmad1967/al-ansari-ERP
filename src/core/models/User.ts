/**
 * User — an ERP user account.
 *
 * A user belongs to an {@link Organization} and may be scoped to a
 * {@link Branch} and {@link Department}, and assigned a {@link Role}.
 */

import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'
import type { Branch } from './Branch'
import type { Department } from './Department'
import type { Organization } from './Organization'
import type { Role } from './Role'
import { UserStatus, type UserStatusValue } from './UserStatus'

export { UserStatus, type UserStatusValue } from './UserStatus'

export interface UserInput {
  username: string
  email: string
  passwordHash: string
  fullName: string
  fullNameAr?: string
  phone?: string
  status?: UserStatusValue
  role?: Role
  organization?: Organization
  branch?: Branch
  department?: Department
  lastLoginAt?: Date
  mustChangePassword?: boolean
  notes?: string
}

export class User extends Realm.Object<User> {
  declare _id: string
  declare username: string
  declare email: string
  declare passwordHash: string
  declare fullName: string
  declare fullNameAr: string | null
  declare phone: string | null
  declare status: UserStatusValue
  declare role: Role | null
  declare organization: Organization | null
  declare branch: Branch | null
  declare department: Department | null
  declare lastLoginAt: Date | null
  declare mustChangePassword: boolean
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  /** Convenience accessor: the assigned role's primary key. */
  get roleId(): string | null {
    return this.role?._id ?? null
  }

  /** Convenience accessor: the owning organization's primary key. */
  get organizationId(): string | null {
    return this.organization?._id ?? null
  }

  /** Convenience accessor: the assigned branch's primary key. */
  get branchId(): string | null {
    return this.branch?._id ?? null
  }

  /** Convenience accessor: the assigned department's primary key. */
  get departmentId(): string | null {
    return this.department?._id ?? null
  }

  static schema: Realm.ObjectSchema = {
    name: 'User',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      username: { type: 'string', indexed: true },
      email: { type: 'string', indexed: true },
      passwordHash: 'string',
      fullName: 'string',
      fullNameAr: { type: 'string', optional: true },
      phone: { type: 'string', optional: true },
      status: { type: 'string', default: UserStatus.Active },
      role: { type: 'object', objectType: 'Role', optional: true },
      organization: { type: 'object', objectType: 'Organization', optional: true },
      branch: { type: 'object', objectType: 'Branch', optional: true },
      department: { type: 'object', objectType: 'Department', optional: true },
      lastLoginAt: { type: 'date', optional: true },
      mustChangePassword: { type: 'bool', default: true },
      notes: { type: 'string', optional: true },
    },
  }
}

/** Entity shape used by repositories (persisted + soft-delete fields). */
export type UserEntity = User & SoftDeletableEntityFields
