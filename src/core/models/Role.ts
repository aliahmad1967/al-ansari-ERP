/**
 * Role — a set of {@link Permission} objects assigned to {@link User} objects.
 *
 * System roles (`isSystem`) are protected from deletion.
 */

import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'
import type { Permission } from './Permission'

export const SystemRoleCode = {
  SuperAdministrator: 'SUPER_ADMINISTRATOR',
  Administrator: 'ADMINISTRATOR',
  HRManager: 'HR_MANAGER',
  FinanceManager: 'FINANCE_MANAGER',
  InventoryManager: 'INVENTORY_MANAGER',
  ProcurementManager: 'PROCUREMENT_MANAGER',
  SalesManager: 'SALES_MANAGER',
  Employee: 'EMPLOYEE',
  Viewer: 'VIEWER',
} as const

export interface RoleInput {
  code: string
  name: string
  nameAr?: string
  description?: string
  isSystem?: boolean
  permissions: Permission[]
}

export class Role extends Realm.Object<Role> {
  declare _id: string
  declare code: string
  declare name: string
  declare nameAr: string | null
  declare description: string | null
  declare isSystem: boolean
  declare permissions: Realm.List<Permission>
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  /** Convenience accessor: number of assigned permissions. */
  get permissionCount(): number {
    return this.permissions.length
  }

  static schema: Realm.ObjectSchema = {
    name: 'Role',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      name: 'string',
      nameAr: { type: 'string', optional: true },
      description: { type: 'string', optional: true },
      isSystem: { type: 'bool', default: false },
      permissions: { type: 'list', objectType: 'Permission' },
    },
  }
}

/** Entity shape used by repositories (persisted + soft-delete fields). */
export type RoleEntity = Role & SoftDeletableEntityFields
