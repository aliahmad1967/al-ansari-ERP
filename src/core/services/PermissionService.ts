/**
 * PermissionService — high-level facade for permission and role queries.
 *
 * This service wraps the pure checking functions from the security layer
 * and the database queries from the repository layer. It is consumed by
 * the usePermissions hook.
 *
 * Architecture note: The pure functions in security/permissions.ts and
 * security/roles.ts can be used directly by any layer. This service adds
 * database-aware queries (e.g., listing all roles, getting role details).
 */

import { PermissionRepository } from '../repositories/PermissionRepository'
import { RoleRepository } from '../repositories/RoleRepository'
import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  hasModuleAccess,
  hasResourceAction,
} from '../security/permissions'
import {
  isAdministrator,
  isSuperAdministrator,
  hasRole,
  ALL_ROLE_CODES,
} from '../security/roles'

export interface RoleSummary {
  id: string
  code: string
  name: string
  nameAr: string | null
  description: string | null
  isSystem: boolean
  permissionCount: number
}

export class PermissionService {
  private readonly permissionRepo = new PermissionRepository()
  private readonly roleRepo = new RoleRepository()

  /** Checks if the user's permission set includes a specific permission. */
  hasPermission(permissionCodes: readonly string[], permission: string): boolean {
    return hasPermission(permissionCodes, permission)
  }

  /** Checks if the user has ALL of the given permissions. */
  hasAllPermissions(
    permissionCodes: readonly string[],
    permissions: readonly string[],
  ): boolean {
    return hasAllPermissions(permissionCodes, permissions)
  }

  /** Checks if the user has ANY of the given permissions. */
  hasAnyPermission(
    permissionCodes: readonly string[],
    permissions: readonly string[],
  ): boolean {
    return hasAnyPermission(permissionCodes, permissions)
  }

  /** Checks if the user has any permission in the given module. */
  hasModuleAccess(permissionCodes: readonly string[], module: string): boolean {
    return hasModuleAccess(permissionCodes, module)
  }

  /** Checks a specific module.resource.action combination. */
  hasResourceAction(
    permissionCodes: readonly string[],
    module: string,
    resource: string,
    action: string,
  ): boolean {
    return hasResourceAction(permissionCodes, module, resource, action)
  }

  /** Checks if the role code is an administrator. */
  isAdministrator(roleCode: string | null): boolean {
    return isAdministrator(roleCode)
  }

  /** Checks if the role code is a super administrator. */
  isSuperAdministrator(roleCode: string | null): boolean {
    return isSuperAdministrator(roleCode)
  }

  /** Checks if the role code matches any of the given codes. */
  hasRole(roleCode: string | null, ...codes: string[]): boolean {
    return hasRole(roleCode, ...codes)
  }

  /** Returns all system role codes. */
  getAllRoleCodes(): readonly string[] {
    return ALL_ROLE_CODES
  }

  /** Returns all roles from the database. */
  getAllRoles(): RoleSummary[] {
    return this.roleRepo.findAll().map((role) => ({
      id: role._id,
      code: role.code,
      name: role.name,
      nameAr: role.nameAr,
      description: role.description,
      isSystem: role.isSystem,
      permissionCount: role.permissions.length,
    }))
  }

  /** Returns all permission codes in the system. */
  getAllPermissionCodes(): string[] {
    return this.permissionRepo.findAll().map((p) => p.code)
  }

  /** Returns permission codes grouped by module. */
  getPermissionsByModule(): Record<string, string[]> {
    const permissions = this.permissionRepo.findAll()
    const grouped: Record<string, string[]> = {}
    for (const p of permissions) {
      const mod = p.module
      if (!grouped[mod]) grouped[mod] = []
      grouped[mod].push(p.code)
    }
    return grouped
  }
}
