// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/i18n/i18n', () => ({
  default: {
    t: (key: string) => {
      const translations: Record<string, string> = {
        'validation.required': 'This field is required',
        'validation.email': 'Please enter a valid email address',
        'validation.minLength': 'Minimum length is {{min}} characters',
        'validation.maxLength': 'Maximum length is {{max}} characters',
        'validation.number': 'Please enter a valid number',
        'validation.min': 'Value must be at least {{min}}',
        'validation.max': 'Value must be at most {{max}}',
        'validation.pattern': 'Invalid format',
      }
      return translations[key] ?? key
    },
    resolvedLanguage: 'en',
    language: 'en',
  },
  t: (key: string) => {
    const translations: Record<string, string> = {
      'validation.required': 'This field is required',
      'validation.email': 'Please enter a valid email address',
      'validation.minLength': 'Minimum length is {{min}} characters',
      'validation.maxLength': 'Maximum length is {{max}} characters',
      'validation.number': 'Please enter a valid number',
      'validation.min': 'Value must be at least {{min}}',
      'validation.max': 'Value must be at most {{max}}',
      'validation.pattern': 'Invalid format',
    }
    return translations[key] ?? key
  },
}))

import { required, email, minLength, maxLength, number, min, max, pattern, combineValidators } from '@/lib/validation'

describe('localized validation', () => {
  describe('required', () => {
    it('returns error for empty string', () => {
      const result = required('')
      expect(typeof result).toBe('string')
      expect(result!.length).toBeGreaterThan(0)
    })

    it('returns undefined for valid string', () => {
      expect(required('hello')).toBeUndefined()
    })

    it('returns error for whitespace-only', () => {
      expect(typeof required('   ')).toBe('string')
    })
  })

  describe('email', () => {
    it('returns error for invalid email', () => {
      expect(typeof email('bad')).toBe('string')
    })

    it('returns undefined for valid email', () => {
      expect(email('test@example.com')).toBeUndefined()
    })

    it('returns error for empty required email', () => {
      expect(typeof email('')).toBe('string')
    })
  })

  describe('minLength', () => {
    it('returns error when too short', () => {
      const validator = minLength(5)
      expect(typeof validator('ab')).toBe('string')
    })

    it('returns undefined when long enough', () => {
      const validator = minLength(5)
      expect(validator('hello')).toBeUndefined()
    })
  })

  describe('maxLength', () => {
    it('returns error when too long', () => {
      const validator = maxLength(3)
      expect(typeof validator('hello')).toBe('string')
    })

    it('returns undefined when within limit', () => {
      const validator = maxLength(10)
      expect(validator('hi')).toBeUndefined()
    })
  })

  describe('number', () => {
    it('returns error for non-number', () => {
      expect(typeof number('abc')).toBe('string')
    })

    it('returns undefined for valid number', () => {
      expect(number('123')).toBeUndefined()
    })

    it('returns undefined for empty string', () => {
      expect(number('')).toBeUndefined()
    })
  })

  describe('min', () => {
    it('returns error below minimum', () => {
      const validator = min(5)
      expect(typeof validator('3')).toBe('string')
    })

    it('returns undefined at minimum', () => {
      const validator = min(5)
      expect(validator('5')).toBeUndefined()
    })
  })

  describe('max', () => {
    it('returns error above maximum', () => {
      const validator = max(10)
      expect(typeof validator('15')).toBe('string')
    })

    it('returns undefined at maximum', () => {
      const validator = max(10)
      expect(validator('10')).toBeUndefined()
    })
  })

  describe('pattern', () => {
    it('returns error for non-matching pattern', () => {
      const validator = pattern(/^\d+$/)
      expect(typeof validator('abc')).toBe('string')
    })

    it('returns undefined for matching pattern', () => {
      const validator = pattern(/^\d+$/)
      expect(validator('12345')).toBeUndefined()
    })
  })

  describe('combineValidators', () => {
    it('returns first error', () => {
      const validator = combineValidators(required, minLength(5))
      expect(typeof validator('')).toBe('string')
    })

    it('returns second error when first passes', () => {
      const validator = combineValidators(required, minLength(5))
      expect(typeof validator('ab')).toBe('string')
    })

    it('returns undefined when all pass', () => {
      const validator = combineValidators(required, minLength(3))
      expect(validator('hello')).toBeUndefined()
    })
  })
})
