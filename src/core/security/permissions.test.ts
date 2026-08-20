import { describe, it, expect } from 'vitest'
import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  hasModuleAccess,
  hasResourceAction,
  getModulePermissions,
  getResourcePermissions,
  isValidPermissionCode,
} from '@/core/security/permissions'

const SAMPLE_PERMISSIONS = [
  'hr.employee.view',
  'hr.employee.create',
  'hr.employee.update',
  'hr.attendance.view',
  'finance.invoice.view',
  'finance.invoice.create',
  'inventory.stock.view',
  'sales.orders.view',
  'sales.orders.create',
] as const

describe('permissions', () => {
  describe('hasPermission', () => {
    it('returns true when permission exists', () => {
      expect(hasPermission(SAMPLE_PERMISSIONS, 'hr.employee.view')).toBe(true)
    })

    it('returns false when permission does not exist', () => {
      expect(hasPermission(SAMPLE_PERMISSIONS, 'hr.employee.delete')).toBe(false)
    })

    it('returns false for empty array', () => {
      expect(hasPermission([], 'hr.employee.view')).toBe(false)
    })
  })

  describe('hasAllPermissions', () => {
    it('returns true when all permissions exist', () => {
      expect(
        hasAllPermissions(SAMPLE_PERMISSIONS, ['hr.employee.view', 'hr.employee.create']),
      ).toBe(true)
    })

    it('returns false when any permission is missing', () => {
      expect(
        hasAllPermissions(SAMPLE_PERMISSIONS, ['hr.employee.view', 'hr.employee.delete']),
      ).toBe(false)
    })

    it('returns true for empty required set', () => {
      expect(hasAllPermissions(SAMPLE_PERMISSIONS, [])).toBe(true)
    })
  })

  describe('hasAnyPermission', () => {
    it('returns true when at least one permission exists', () => {
      expect(
        hasAnyPermission(SAMPLE_PERMISSIONS, ['hr.employee.delete', 'hr.employee.view']),
      ).toBe(true)
    })

    it('returns false when no permissions match', () => {
      expect(
        hasAnyPermission(SAMPLE_PERMISSIONS, ['hr.employee.delete', 'hr.employee.restore']),
      ).toBe(false)
    })

    it('returns false for empty required set', () => {
      expect(hasAnyPermission(SAMPLE_PERMISSIONS, [])).toBe(false)
    })
  })

  describe('hasModuleAccess', () => {
    it('returns true when user has any permission in module', () => {
      expect(hasModuleAccess(SAMPLE_PERMISSIONS, 'hr')).toBe(true)
    })

    it('returns false when user has no permissions in module', () => {
      expect(hasModuleAccess(SAMPLE_PERMISSIONS, 'assets')).toBe(false)
    })

    it('matches submodule access via prefix', () => {
      expect(hasModuleAccess(SAMPLE_PERMISSIONS, 'hr.employee')).toBe(true)
    })

    it('does not match unrelated modules', () => {
      expect(hasModuleAccess(SAMPLE_PERMISSIONS, 'hr.payroll')).toBe(false)
    })
  })

  describe('hasResourceAction', () => {
    it('returns true for exact match', () => {
      expect(hasResourceAction(SAMPLE_PERMISSIONS, 'hr', 'employee', 'view')).toBe(true)
    })

    it('returns false when action does not match', () => {
      expect(hasResourceAction(SAMPLE_PERMISSIONS, 'hr', 'employee', 'delete')).toBe(false)
    })

    it('returns false when resource does not match', () => {
      expect(hasResourceAction(SAMPLE_PERMISSIONS, 'hr', 'payroll', 'view')).toBe(false)
    })
  })

  describe('getModulePermissions', () => {
    it('returns all permissions for a module', () => {
      const hrPerms = getModulePermissions(SAMPLE_PERMISSIONS, 'hr')
      expect(hrPerms).toHaveLength(4)
      expect(hrPerms.every((p) => p.startsWith('hr.'))).toBe(true)
    })

    it('returns empty array for unknown module', () => {
      expect(getModulePermissions(SAMPLE_PERMISSIONS, 'projects')).toEqual([])
    })
  })

  describe('getResourcePermissions', () => {
    it('returns permissions for a specific resource', () => {
      const empPerms = getResourcePermissions(SAMPLE_PERMISSIONS, 'hr', 'employee')
      expect(empPerms).toHaveLength(3)
    })

    it('returns empty array when no match', () => {
      expect(
        getResourcePermissions(SAMPLE_PERMISSIONS, 'hr', 'nonexistent'),
      ).toEqual([])
    })
  })

  describe('isValidPermissionCode', () => {
    it('returns true for valid format', () => {
      expect(isValidPermissionCode('hr.employee.view')).toBe(true)
    })

    it('returns false for too few parts', () => {
      expect(isValidPermissionCode('hr.employee')).toBe(false)
    })

    it('returns false for too many parts', () => {
      expect(isValidPermissionCode('hr.employee.view.extra')).toBe(false)
    })

    it('returns false for empty part', () => {
      expect(isValidPermissionCode('hr..view')).toBe(false)
    })

    it('returns false for empty string', () => {
      expect(isValidPermissionCode('')).toBe(false)
    })
  })
})
