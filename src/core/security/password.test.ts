import { describe, it, expect } from 'vitest'
import {
  validatePassword,
  sanitizePasswordLength,
  MAX_PASSWORD_LENGTH,
  DEFAULT_PASSWORD_POLICY,
} from '@/core/security/password'

describe('password security', () => {
  describe('validatePassword', () => {
    it('accepts a valid password', () => {
      const result = validatePassword('Strong1Pass')
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('rejects password shorter than minLength', () => {
      const result = validatePassword('Ab1')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('validation.passwordTooShort')
    })

    it('rejects password longer than maxLength', () => {
      const result = validatePassword('A'.repeat(129) + '1a')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('validation.passwordTooLong')
    })

    it('rejects password without uppercase', () => {
      const result = validatePassword('lowercase1')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('validation.passwordNoUppercase')
    })

    it('rejects password without lowercase', () => {
      const result = validatePassword('UPPERCASE1')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('validation.passwordNoLowercase')
    })

    it('rejects password without digit', () => {
      const result = validatePassword('NoDigitHere')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('validation.passwordNoDigit')
    })

    it('requires special character when policy demands it', () => {
      const policy = { ...DEFAULT_PASSWORD_POLICY, requireSpecial: true }
      const result = validatePassword('NoSpecial1', policy)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('validation.passwordNoSpecial')
    })

    it('accepts special character when required', () => {
      const policy = { ...DEFAULT_PASSWORD_POLICY, requireSpecial: true }
      const result = validatePassword('HasSpecial1!', policy)
      expect(result.valid).toBe(true)
    })

    it('collects multiple errors for very weak passwords', () => {
      const result = validatePassword('weak')
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThanOrEqual(3)
    })

    it('respects custom policy disabling all requirements', () => {
      const policy = {
        ...DEFAULT_PASSWORD_POLICY,
        requireUppercase: false,
        requireLowercase: false,
        requireDigit: false,
        requireSpecial: false,
        minLength: 1,
      }
      const result = validatePassword('a', policy)
      expect(result.valid).toBe(true)
    })
  })

  describe('sanitizePasswordLength', () => {
    it('returns password unchanged when under limit', () => {
      expect(sanitizePasswordLength('short')).toBe('short')
    })

    it('truncates at MAX_PASSWORD_LENGTH', () => {
      const longPass = 'a'.repeat(200)
      const result = sanitizePasswordLength(longPass)
      expect(result.length).toBe(MAX_PASSWORD_LENGTH)
    })

    it('returns empty string for empty input', () => {
      expect(sanitizePasswordLength('')).toBe('')
    })

    it('returns password at exactly the limit', () => {
      const exact = 'a'.repeat(MAX_PASSWORD_LENGTH)
      expect(sanitizePasswordLength(exact)).toBe(exact)
    })
  })
})
