/**
 * usePermissions — React hook for permission and role checking.
 *
 * Consumes the auth store to get the current session's permission codes
 * and role code, then exposes checking functions for use in components.
 */

import { useSyncExternalStore } from 'react'

import { getAuthState, subscribeAuth } from '@/stores/auth.store'
import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  hasModuleAccess,
  hasResourceAction,
} from '@/core/security/permissions'
import { isAdministrator, isSuperAdministrator, hasRole } from '@/core/security/roles'

export interface UsePermissionsResult {
  /** All permission codes for the current user. */
  permissionCodes: readonly string[]
  /** The current user's role code. */
  roleCode: string | null
  /** Whether the user is authenticated. */
  isAuthenticated: boolean
  /** Checks if the user has a specific permission. */
  can: (permission: string) => boolean
  /** Checks if the user has ALL of the given permissions. */
  canAll: (permissions: string[]) => boolean
  /** Checks if the user has ANY of the given permissions. */
  canAny: (permissions: string[]) => boolean
  /** Checks if the user has any permission in the given module. */
  canAccessModule: (module: string) => boolean
  /** Checks a specific module.resource.action. */
  canDo: (module: string, resource: string, action: string) => boolean
  /** Whether the user is an administrator. */
  isAdmin: boolean
  /** Whether the user is a super administrator. */
  isSuperAdmin: boolean
  /** Checks if the user has a specific role. */
  hasRole: (...codes: string[]) => boolean
}

export function usePermissions(): UsePermissionsResult {
  const authState = useSyncExternalStore(subscribeAuth, getAuthState)

  const session = authState.session
  const permissionCodes = session?.permissionCodes ?? []
  const roleCode = session?.user.roleCode ?? null
  const isAuthenticated = authState.status === 'authenticated'

  return {
    permissionCodes,
    roleCode,
    isAuthenticated,
    can: (permission: string) => hasPermission(permissionCodes, permission),
    canAll: (permissions: string[]) => hasAllPermissions(permissionCodes, permissions),
    canAny: (permissions: string[]) => hasAnyPermission(permissionCodes, permissions),
    canAccessModule: (module: string) => hasModuleAccess(permissionCodes, module),
    canDo: (module: string, resource: string, action: string) =>
      hasResourceAction(permissionCodes, module, resource, action),
    isAdmin: isAdministrator(roleCode),
    isSuperAdmin: isSuperAdministrator(roleCode),
    hasRole: (...codes: string[]) => hasRole(roleCode, ...codes),
  }
}
