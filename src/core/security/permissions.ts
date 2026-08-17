/**
 * Permission checking — pure functions for authorization decisions.
 *
 * These functions operate on permission code sets (string arrays) and never
 * access the database directly. This makes them testable, fast, and
 * replaceable by a server-side authorization layer in the future.
 *
 * Permission format: module.resource.action
 * Examples: hr.employee.view, finance.invoice.approve
 */

/**
 * Checks whether a set of permission codes includes the exact permission.
 */
export function hasPermission(permissionCodes: readonly string[], permission: string): boolean {
  return permissionCodes.includes(permission)
}

/**
 * Checks whether a set of permission codes includes ALL of the given permissions.
 */
export function hasAllPermissions(
  permissionCodes: readonly string[],
  permissions: readonly string[],
): boolean {
  return permissions.every((p) => permissionCodes.includes(p))
}

/**
 * Checks whether a set of permission codes includes ANY of the given permissions.
 */
export function hasAnyPermission(
  permissionCodes: readonly string[],
  permissions: readonly string[],
): boolean {
  return permissions.some((p) => permissionCodes.includes(p))
}

/**
 * Checks whether the user has any permission in the given module.
 */
export function hasModuleAccess(
  permissionCodes: readonly string[],
  module: string,
): boolean {
  return permissionCodes.some((code) => code.startsWith(`${module}.`))
}

/**
 * Checks whether the user has a specific action on a module.resource.
 */
export function hasResourceAction(
  permissionCodes: readonly string[],
  module: string,
  resource: string,
  action: string,
): boolean {
  return permissionCodes.includes(`${module}.${resource}.${action}`)
}

/**
 * Returns all permission codes matching a given module.
 */
export function getModulePermissions(
  permissionCodes: readonly string[],
  module: string,
): string[] {
  return permissionCodes.filter((code) => code.startsWith(`${module}.`))
}

/**
 * Returns all permission codes matching a given module and resource.
 */
export function getResourcePermissions(
  permissionCodes: readonly string[],
  module: string,
  resource: string,
): string[] {
  const prefix = `${module}.${resource}.`
  return permissionCodes.filter((code) => code.startsWith(prefix))
}

/**
 * Validates that a permission code string matches the module.resource.action format.
 */
export function isValidPermissionCode(code: string): boolean {
  const parts = code.split('.')
  return parts.length === 3 && parts.every((p) => p.length > 0)
}
