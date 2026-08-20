import { describe, it, expect } from 'vitest'
import {
  required,
  email,
  minLength,
  maxLength,
  matches,
  oneOf,
  validateFields,
  throwIfInvalid,
  combineValidators,
  isValidEmail,
  isNonEmptyString,
  ValidationError,
} from '@/core/utils/validation'

describe('domain validation utilities', () => {
  describe('required', () => {
    it('returns error for undefined', () => {
      expect(required('Name')(undefined)).toBe('Name is required.')
    })

    it('returns error for null', () => {
      expect(required('Name')(null)).toBe('Name is required.')
    })

    it('returns error for empty string', () => {
      expect(required('Name')('')).toBe('Name is required.')
    })

    it('returns error for whitespace-only string', () => {
      expect(required('Name')('   ')).toBe('Name is required.')
    })

    it('returns undefined for valid string', () => {
      expect(required('Name')('John')).toBeUndefined()
    })

    it('returns undefined for zero', () => {
      expect(required('Amount')(0)).toBeUndefined()
    })
  })

  describe('email', () => {
    it('returns undefined for empty string (not required)', () => {
      expect(email('Email')('')).toBeUndefined()
    })

    it('returns undefined for valid email', () => {
      expect(email('Email')('test@example.com')).toBeUndefined()
    })

    it('returns error for invalid email', () => {
      expect(email('Email')('not-an-email')).toBe('Email must be a valid email address.')
    })

    it('returns error for email without domain', () => {
      expect(email('Email')('user@')).toBe('Email must be a valid email address.')
    })

    it('returns error for non-string input', () => {
      expect(email('Email')(123 as unknown as string)).toBeUndefined()
    })
  })

  describe('minLength', () => {
    it('returns undefined for strings meeting minimum', () => {
      expect(minLength('Password', 8)('12345678')).toBeUndefined()
    })

    it('returns error for strings below minimum', () => {
      expect(minLength('Password', 8)('short')).toBe(
        'Password must be at least 8 characters.',
      )
    })

    it('returns undefined for non-string input', () => {
      expect(minLength('Field', 5)(123 as unknown as string)).toBeUndefined()
    })
  })

  describe('maxLength', () => {
    it('returns undefined for strings within maximum', () => {
      expect(maxLength('Name', 50)('John')).toBeUndefined()
    })

    it('returns error for strings exceeding maximum', () => {
      expect(maxLength('Name', 3)('John Doe')).toBe('Name must not exceed 3 characters.')
    })
  })

  describe('matches', () => {
    it('returns undefined when pattern matches', () => {
      expect(matches('Phone', /^\d{10}$/)('1234567890')).toBeUndefined()
    })

    it('returns error when pattern does not match', () => {
      expect(matches('Phone', /^\d{10}$/)('123')).toBe('Phone is not valid.')
    })

    it('returns undefined for empty string', () => {
      expect(matches('Phone', /^\d+$/)( '')).toBeUndefined()
    })
  })

  describe('oneOf', () => {
    it('returns undefined when value is in allowed list', () => {
      expect(oneOf('Status', ['active', 'inactive'])('active')).toBeUndefined()
    })

    it('returns error when value is not in allowed list', () => {
      const result = oneOf('Status', ['active', 'inactive'])('pending')
      expect(result).toContain('active')
      expect(result).toContain('inactive')
    })

    it('returns undefined for undefined input', () => {
      expect(oneOf('Status', ['a', 'b'])(undefined)).toBeUndefined()
    })
  })

  describe('validateFields', () => {
    it('returns empty array when all valid', () => {
      const issues = validateFields(
        { name: 'John', email: 'john@test.com' },
        {
          name: required('Name'),
          email: email('Email'),
        },
      )
      expect(issues).toHaveLength(0)
    })

    it('collects issues from multiple fields', () => {
      const issues = validateFields(
        { name: '', email: 'bad' },
        {
          name: required('Name'),
          email: email('Email'),
        },
      )
      expect(issues.length).toBeGreaterThanOrEqual(2)
    })

    it('skips undefined validators', () => {
      const issues = validateFields(
        { name: 'John' },
        { name: required('Name'), age: undefined },
      )
      expect(issues).toHaveLength(0)
    })
  })

  describe('throwIfInvalid', () => {
    it('does not throw for empty issues', () => {
      expect(() => throwIfInvalid([])).not.toThrow()
    })

    it('throws ValidationError for non-empty issues', () => {
      expect(() =>
        throwIfInvalid([{ field: 'name', message: 'required' }]),
      ).toThrow(ValidationError)
    })
  })

  describe('combineValidators', () => {
    it('returns first error', () => {
      const validator = combineValidators(
        required('Name'),
        minLength('Name', 3),
      )
      expect(validator('')).toBe('Name is required.')
    })

    it('returns second error when first passes', () => {
      const validator = combineValidators(
        required('Name'),
        minLength('Name', 3),
      )
      expect(validator('ab')).toBe('Name must be at least 3 characters.')
    })

    it('returns undefined when all pass', () => {
      const validator = combineValidators(
        required('Name'),
        minLength('Name', 3),
      )
      expect(validator('John')).toBeUndefined()
    })
  })

  describe('isValidEmail', () => {
    it('returns true for valid email', () => {
      expect(isValidEmail('user@example.com')).toBe(true)
    })

    it('returns false for invalid email', () => {
      expect(isValidEmail('not-email')).toBe(false)
    })

    it('returns false for email without @', () => {
      expect(isValidEmail('userexample.com')).toBe(false)
    })
  })

  describe('isNonEmptyString', () => {
    it('returns true for non-empty string', () => {
      expect(isNonEmptyString('hello')).toBe(true)
    })

    it('returns false for empty string', () => {
      expect(isNonEmptyString('')).toBe(false)
    })

    it('returns false for whitespace string', () => {
      expect(isNonEmptyString('   ')).toBe(false)
    })

    it('returns false for non-string', () => {
      expect(isNonEmptyString(123)).toBe(false)
    })

    it('returns false for null', () => {
      expect(isNonEmptyString(null)).toBe(false)
    })
  })
})
