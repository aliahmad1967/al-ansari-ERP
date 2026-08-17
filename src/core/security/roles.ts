/**
 * Role checking — pure functions for role-based authorization.
 *
 * These functions never access the database. They operate on role code strings
 * which are the stable identifiers for system roles. A future server
 * authorization layer can enforce the same model.
 */

/**
 * System role code constants. These match the codes stored in the Role model.
 */
export const AUTH_ROLE_CODES = {
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

export type AuthRoleCode = (typeof AUTH_ROLE_CODES)[keyof typeof AUTH_ROLE_CODES]

/** All valid system role codes. */
export const ALL_ROLE_CODES: readonly string[] = Object.values(AUTH_ROLE_CODES)

/**
 * Checks whether a role code is one of the recognized system role codes.
 */
export function isSystemRole(roleCode: string | null): boolean {
  return roleCode !== null && ALL_ROLE_CODES.includes(roleCode)
}

/**
 * Checks whether a role code has administrative privileges (full access).
 */
export function isAdministrator(roleCode: string | null): boolean {
  return (
    roleCode === AUTH_ROLE_CODES.SuperAdministrator ||
    roleCode === AUTH_ROLE_CODES.Administrator
  )
}

/**
 * Checks whether a role code is the super administrator (highest privilege).
 */
export function isSuperAdministrator(roleCode: string | null): boolean {
  return roleCode === AUTH_ROLE_CODES.SuperAdministrator
}

/**
 * Checks whether a role code matches any of the given codes.
 */
export function hasRole(roleCode: string | null, ...codes: string[]): boolean {
  return roleCode !== null && codes.includes(roleCode)
}

/**
 * Returns a human-readable label for a system role code.
 */
export function getRoleLabel(
  roleCode: string,
  locale: 'ar' | 'en' = 'en',
): string {
  const labels: Record<string, { en: string; ar: string }> = {
    [AUTH_ROLE_CODES.SuperAdministrator]: { en: 'Super Administrator', ar: 'مدير النظام الأعلى' },
    [AUTH_ROLE_CODES.Administrator]: { en: 'Administrator', ar: 'مدير النظام' },
    [AUTH_ROLE_CODES.HRManager]: { en: 'HR Manager', ar: 'مدير الموارد البشرية' },
    [AUTH_ROLE_CODES.FinanceManager]: { en: 'Finance Manager', ar: 'مدير المالية' },
    [AUTH_ROLE_CODES.InventoryManager]: { en: 'Inventory Manager', ar: 'مدير المخزون' },
    [AUTH_ROLE_CODES.ProcurementManager]: { en: 'Procurement Manager', ar: 'مدير المشتريات' },
    [AUTH_ROLE_CODES.SalesManager]: { en: 'Sales Manager', ar: 'مدير المبيعات' },
    [AUTH_ROLE_CODES.Employee]: { en: 'Employee', ar: 'موظف' },
    [AUTH_ROLE_CODES.Viewer]: { en: 'Viewer', ar: 'مشاهد' },
  }
  return labels[roleCode]?.[locale] ?? roleCode
}
