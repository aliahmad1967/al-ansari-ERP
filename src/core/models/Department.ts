/**
 * Department — an organizational unit that belongs to a {@link Branch} and is
 * optionally managed by a {@link User}.
 */

import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'
import type { Branch } from './Branch'
import type { User } from './User'
import { DepartmentStatus, type DepartmentStatusValue } from './DepartmentStatus'

export { DepartmentStatus, type DepartmentStatusValue } from './DepartmentStatus'

export interface DepartmentInput {
  code: string
  name: string
  nameAr?: string
  branch: Branch
  manager?: User
  status?: DepartmentStatusValue
  notes?: string
}

export class Department extends Realm.Object<Department> {
  declare _id: string
  declare code: string
  declare name: string
  declare nameAr: string | null
  declare branch: Branch
  declare manager: User | null
  declare status: DepartmentStatusValue
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  /** Convenience accessor: the parent branch's primary key. */
  get branchId(): string | null {
    return this.branch?._id ?? null
  }

  /** Convenience accessor: the manager's primary key. */
  get managerId(): string | null {
    return this.manager?._id ?? null
  }

  static schema: Realm.ObjectSchema = {
    name: 'Department',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      name: 'string',
      nameAr: { type: 'string', optional: true },
      branch: { type: 'object', objectType: 'Branch', optional: true },
      manager: { type: 'object', objectType: 'User', optional: true },
      status: { type: 'string', default: DepartmentStatus.Active },
      notes: { type: 'string', optional: true },
    },
  }
}

/** Entity shape used by repositories (persisted + soft-delete fields). */
export type DepartmentEntity = Department & SoftDeletableEntityFields
