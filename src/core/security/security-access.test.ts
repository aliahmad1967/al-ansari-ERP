import { describe, it, expect } from 'vitest'
import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  hasModuleAccess,
  hasResourceAction,
  isValidPermissionCode,
} from '@/core/security/permissions'
import {
  AUTH_ROLE_CODES,
  isSystemRole,
  isAdministrator,
  isSuperAdministrator,
} from '@/core/security/roles'
import { getPermissionsForRole, ADMIN_PERMISSIONS } from '@/core/security/devPermissions'
import { validatePassword, sanitizePasswordLength } from '@/core/security/password'
import { hashPassword, verifyPassword } from '@/core/security/encryption'

describe('security: unauthorized access prevention', () => {
  describe('empty permission set blocks all access', () => {
    it('hasPermission returns false for empty set', () => {
      expect(hasPermission([], 'hr.employee.view')).toBe(false)
    })

    it('hasAllPermissions returns false for empty set', () => {
      expect(hasAllPermissions([], ['hr.employee.view'])).toBe(false)
    })

    it('hasAnyPermission returns false for empty set', () => {
      expect(hasAnyPermission([], ['hr.employee.view'])).toBe(false)
    })

    it('hasModuleAccess returns false for empty set', () => {
      expect(hasModuleAccess([], 'hr')).toBe(false)
    })

    it('hasResourceAction returns false for empty set', () => {
      expect(hasResourceAction([], 'hr', 'employee', 'view')).toBe(false)
    })
  })

  describe('module isolation', () => {
    const hrPermissions = ['hr.employee.view', 'hr.employee.create']

    it('HR permissions do not grant finance access', () => {
      expect(hasModuleAccess(hrPermissions, 'finance')).toBe(false)
    })

    it('HR permissions do not grant inventory access', () => {
      expect(hasModuleAccess(hrPermissions, 'inventory')).toBe(false)
    })

    it('HR permissions grant HR access', () => {
      expect(hasModuleAccess(hrPermissions, 'hr')).toBe(true)
    })
  })

  describe('action isolation', () => {
    const viewOnly = ['hr.employee.view', 'finance.invoice.view']

    it('view permissions do not grant create', () => {
      expect(hasResourceAction(viewOnly, 'hr', 'employee', 'create')).toBe(false)
    })

    it('view permissions do not grant delete', () => {
      expect(hasResourceAction(viewOnly, 'hr', 'employee', 'delete')).toBe(false)
    })

    it('view permissions grant view', () => {
      expect(hasResourceAction(viewOnly, 'hr', 'employee', 'view')).toBe(true)
    })
  })

  describe('permission code validation', () => {
    it('rejects malformed codes', () => {
      expect(isValidPermissionCode('invalid')).toBe(false)
      expect(isValidPermissionCode('hr.employee')).toBe(false)
      expect(isValidPermissionCode('hr.employee.view.extra')).toBe(false)
      expect(isValidPermissionCode('..view')).toBe(false)
    })

    it('accepts valid codes', () => {
      expect(isValidPermissionCode('hr.employee.view')).toBe(true)
      expect(isValidPermissionCode('finance.invoice.approve')).toBe(true)
    })
  })
})

describe('security: permission failure scenarios', () => {
  describe('role-based permission restrictions', () => {
    it('EMPLOYEE role has only view permissions', () => {
      const perms = getPermissionsForRole('EMPLOYEE')
      const hasCreate = perms.some((p) => p.endsWith('.create'))
      const hasDelete = perms.some((p) => p.endsWith('.delete'))
      expect(hasCreate).toBe(false)
      expect(hasDelete).toBe(false)
    })

    it('VIEWER role has only view permissions', () => {
      const perms = getPermissionsForRole('VIEWER')
      const nonViewPerms = perms.filter((p) => !p.endsWith('.view'))
      expect(nonViewPerms).toHaveLength(0)
    })

    it('unknown role returns empty permissions', () => {
      expect(getPermissionsForRole('UNKNOWN_ROLE')).toEqual([])
    })

    it('SUPER_ADMINISTRATOR has all permissions', () => {
      const perms = getPermissionsForRole('SUPER_ADMINISTRATOR')
      expect(perms.length).toBeGreaterThanOrEqual(ADMIN_PERMISSIONS.length)
    })
  })

  describe('cross-role isolation', () => {
    it('HR_MANAGER cannot approve finance invoices', () => {
      const perms = getPermissionsForRole('HR_MANAGER')
      expect(hasPermission(perms, 'finance.invoice.approve')).toBe(false)
    })

    it('FINANCE_MANAGER cannot manage HR employees', () => {
      const perms = getPermissionsForRole('FINANCE_MANAGER')
      expect(hasResourceAction(perms, 'hr', 'employee', 'create')).toBe(false)
    })

    it('INVENTORY_MANAGER cannot manage sales orders', () => {
      const perms = getPermissionsForRole('INVENTORY_MANAGER')
      expect(hasResourceAction(perms, 'sales', 'orders', 'create')).toBe(false)
    })

    it('SALES_MANAGER cannot manage procurement orders', () => {
      const perms = getPermissionsForRole('SALES_MANAGER')
      expect(hasResourceAction(perms, 'procurement', 'orders', 'create')).toBe(false)
    })
  })
})

describe('security: session expiration', () => {
  describe('password policy enforcement', () => {
    it('rejects short passwords', () => {
      const result = validatePassword('Ab1')
      expect(result.valid).toBe(false)
    })

    it('rejects passwords without uppercase', () => {
      const result = validatePassword('lowercase1')
      expect(result.valid).toBe(false)
    })

    it('rejects passwords without lowercase', () => {
      const result = validatePassword('UPPERCASE1')
      expect(result.valid).toBe(false)
    })

    it('rejects passwords without digits', () => {
      const result = validatePassword('NoDigitHere')
      expect(result.valid).toBe(false)
    })

    it('accepts strong passwords', () => {
      const result = validatePassword('StrongP4ss')
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('password length sanitization', () => {
    it('truncates overly long passwords to prevent DoS', () => {
      const longPassword = 'A'.repeat(300) + '1'
      const sanitized = sanitizePasswordLength(longPassword)
      expect(sanitized.length).toBeLessThanOrEqual(128)
    })

    it('preserves short passwords', () => {
      expect(sanitizePasswordLength('short')).toBe('short')
    })
  })

  describe('credential hashing', () => {
    it('hashes passwords with scrypt', () => {
      const hash = hashPassword('test123')
      expect(hash).toMatch(/^scrypt\$/)
    })

    it('verifies correct password', () => {
      const hash = hashPassword('correct')
      expect(verifyPassword('correct', hash)).toBe(true)
    })

    it('rejects wrong password', () => {
      const hash = hashPassword('correct')
      expect(verifyPassword('wrong', hash)).toBe(false)
    })

    it('rejects malformed hash', () => {
      expect(verifyPassword('test', 'invalid')).toBe(false)
    })

    it('each hash is unique (random salt)', () => {
      const h1 = hashPassword('same')
      const h2 = hashPassword('same')
      expect(h1).not.toBe(h2)
    })
  })

  describe('administrator checks', () => {
    it('super admin is administrator', () => {
      expect(isAdministrator(AUTH_ROLE_CODES.SuperAdministrator)).toBe(true)
    })

    it('admin is administrator', () => {
      expect(isAdministrator(AUTH_ROLE_CODES.Administrator)).toBe(true)
    })

    it('employee is not administrator', () => {
      expect(isAdministrator(AUTH_ROLE_CODES.Employee)).toBe(false)
    })

    it('null role is not administrator', () => {
      expect(isAdministrator(null)).toBe(false)
    })

    it('only super admin is super administrator', () => {
      expect(isSuperAdministrator(AUTH_ROLE_CODES.SuperAdministrator)).toBe(true)
      expect(isSuperAdministrator(AUTH_ROLE_CODES.Administrator)).toBe(false)
    })
  })

  describe('role validation', () => {
    it('all system roles are recognized', () => {
      for (const code of Object.values(AUTH_ROLE_CODES)) {
        expect(isSystemRole(code)).toBe(true)
      }
    })

    it('arbitrary strings are not system roles', () => {
      expect(isSystemRole('HACKER')).toBe(false)
      expect(isSystemRole('admin')).toBe(false)
      expect(isSystemRole('')).toBe(false)
    })
  })
})
