/**
 * Permission — a granular capability expressed as `module.resource.action`
 * (e.g. `hr.employee.view`). Permissions are assigned to {@link Role} objects.
 */

import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export interface PermissionInput {
  code: string
  name: string
  nameAr?: string
  module: string
  resource: string
  action: string
  description?: string
}

/** Builds the canonical permission code for a module/resource/action triple. */
export function buildPermissionCode(module: string, resource: string, action: string): string {
  return `${module}.${resource}.${action}`
}

export class Permission extends Realm.Object<Permission> {
  declare _id: string
  declare code: string
  declare name: string
  declare nameAr: string | null
  declare module: string
  declare resource: string
  declare action: string
  declare description: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'Permission',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      name: 'string',
      nameAr: { type: 'string', optional: true },
      module: { type: 'string', indexed: true },
      resource: 'string',
      action: 'string',
      description: { type: 'string', optional: true },
    },
  }
}

/** Entity shape used by repositories (persisted + soft-delete fields). */
export type PermissionEntity = Permission & SoftDeletableEntityFields
