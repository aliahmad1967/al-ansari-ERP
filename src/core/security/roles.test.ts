import { describe, it, expect } from 'vitest'
import {
  AUTH_ROLE_CODES,
  ALL_ROLE_CODES,
  isSystemRole,
  isAdministrator,
  isSuperAdministrator,
  hasRole,
  getRoleLabel,
} from '@/core/security/roles'

describe('roles', () => {
  describe('isSystemRole', () => {
    it('returns true for valid system role', () => {
      expect(isSystemRole('ADMINISTRATOR')).toBe(true)
    })

    it('returns true for all defined roles', () => {
      for (const code of ALL_ROLE_CODES) {
        expect(isSystemRole(code)).toBe(true)
      }
    })

    it('returns false for unknown role', () => {
      expect(isSystemRole('UNKNOWN_ROLE')).toBe(false)
    })

    it('returns false for null', () => {
      expect(isSystemRole(null)).toBe(false)
    })

    it('returns false for empty string', () => {
      expect(isSystemRole('')).toBe(false)
    })
  })

  describe('isAdministrator', () => {
    it('returns true for SUPER_ADMINISTRATOR', () => {
      expect(isAdministrator(AUTH_ROLE_CODES.SuperAdministrator)).toBe(true)
    })

    it('returns true for ADMINISTRATOR', () => {
      expect(isAdministrator(AUTH_ROLE_CODES.Administrator)).toBe(true)
    })

    it('returns false for HR_MANAGER', () => {
      expect(isAdministrator(AUTH_ROLE_CODES.HRManager)).toBe(false)
    })

    it('returns false for null', () => {
      expect(isAdministrator(null)).toBe(false)
    })
  })

  describe('isSuperAdministrator', () => {
    it('returns true for SUPER_ADMINISTRATOR', () => {
      expect(isSuperAdministrator(AUTH_ROLE_CODES.SuperAdministrator)).toBe(true)
    })

    it('returns false for ADMINISTRATOR', () => {
      expect(isSuperAdministrator(AUTH_ROLE_CODES.Administrator)).toBe(false)
    })

    it('returns false for null', () => {
      expect(isSuperAdministrator(null)).toBe(false)
    })
  })

  describe('hasRole', () => {
    it('returns true when role matches', () => {
      expect(hasRole('HR_MANAGER', 'HR_MANAGER', 'ADMINISTRATOR')).toBe(true)
    })

    it('returns false when role does not match', () => {
      expect(hasRole('EMPLOYEE', 'HR_MANAGER', 'ADMINISTRATOR')).toBe(false)
    })

    it('returns false for null role', () => {
      expect(hasRole(null, 'HR_MANAGER')).toBe(false)
    })
  })

  describe('getRoleLabel', () => {
    it('returns English label', () => {
      expect(getRoleLabel('ADMINISTRATOR', 'en')).toBe('Administrator')
    })

    it('returns Arabic label', () => {
      expect(getRoleLabel('ADMINISTRATOR', 'ar')).toBe('مدير النظام')
    })

    it('returns the code for unknown roles', () => {
      expect(getRoleLabel('UNKNOWN', 'en')).toBe('UNKNOWN')
    })

    it('defaults to English', () => {
      expect(getRoleLabel('HR_MANAGER')).toBe('HR Manager')
    })

    it('returns labels for all system roles in English', () => {
      for (const code of ALL_ROLE_CODES) {
        const label = getRoleLabel(code, 'en')
        expect(typeof label).toBe('string')
        expect(label.length).toBeGreaterThan(0)
      }
    })

    it('returns labels for all system roles in Arabic', () => {
      for (const code of ALL_ROLE_CODES) {
        const label = getRoleLabel(code, 'ar')
        expect(typeof label).toBe('string')
        expect(label.length).toBeGreaterThan(0)
      }
    })
  })
})
