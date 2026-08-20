// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/i18n/i18n', () => ({
  default: {
    t: (key: string) => {
      const translations: Record<string, string> = {
        'common.currency.sar': 'SAR',
        'common.currency.aed': 'AED',
        'common.currency.usd': 'USD',
        'common.currency.eur': 'EUR',
        'common.currency.gbp': 'GBP',
      }
      return translations[key] ?? key
    },
    resolvedLanguage: 'en',
    language: 'en',
  },
  t: (key: string) => {
    const translations: Record<string, string> = {
      'common.currency.sar': 'SAR',
      'common.currency.aed': 'AED',
      'common.currency.usd': 'USD',
      'common.currency.eur': 'EUR',
      'common.currency.gbp': 'GBP',
    }
    return translations[key] ?? key
  },
  getLanguage: () => 'en',
  isArabic: () => false,
  SUPPORTED_LANGUAGES: ['ar', 'en'],
  DEFAULT_LANGUAGE: 'ar',
}))

import { getLocale, formatNumber, formatCurrency, formatDate, formatTime, formatBytes, getDateFormatter } from '@/lib/format'

describe('localization & formatting', () => {
  describe('getLocale', () => {
    it('returns ar-EG for Arabic', () => {
      expect(getLocale('ar')).toBe('ar-EG')
    })

    it('returns en-US for English', () => {
      expect(getLocale('en')).toBe('en-US')
    })

    it('defaults to ar-EG when no language specified', () => {
      expect(getLocale()).toBe('ar-EG')
    })

    it('passes through unknown language codes', () => {
      expect(getLocale('fr')).toBe('fr')
    })
  })

  describe('formatNumber', () => {
    it('formats a number', () => {
      const result = formatNumber(1234.56)
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('formats with options', () => {
      const result = formatNumber(1234.56, { minimumFractionDigits: 2 })
      expect(typeof result).toBe('string')
    })
  })

  describe('formatCurrency', () => {
    it('formats a currency amount', () => {
      const result = formatCurrency(1234.56)
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('formats with custom currency', () => {
      const result = formatCurrency(1000, 'USD')
      expect(typeof result).toBe('string')
    })
  })

  describe('formatDate', () => {
    it('formats a Date object', () => {
      const result = formatDate(new Date(2025, 5, 15))
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('formats an ISO string', () => {
      const result = formatDate('2025-06-15')
      expect(typeof result).toBe('string')
    })

    it('returns empty string for invalid date', () => {
      expect(formatDate('invalid-date')).toBe('')
    })

    it('formats with custom options', () => {
      const result = formatDate(new Date(2025, 5, 15), { year: 'numeric', month: 'long' })
      expect(typeof result).toBe('string')
    })
  })

  describe('formatTime', () => {
    it('formats time', () => {
      const result = formatTime(new Date(2025, 5, 15, 14, 30))
      expect(typeof result).toBe('string')
    })
  })

  describe('formatBytes', () => {
    it('formats 0 bytes', () => {
      expect(formatBytes(0)).toBe('0 B')
    })

    it('formats bytes', () => {
      expect(formatBytes(1024)).toBe('1.0 KB')
    })

    it('formats megabytes', () => {
      expect(formatBytes(1048576)).toBe('1.0 MB')
    })

    it('formats gigabytes', () => {
      expect(formatBytes(1073741824)).toBe('1.0 GB')
    })

    it('formats fractional values', () => {
      expect(formatBytes(1536)).toBe('1.5 KB')
    })
  })

  describe('getDateFormatter', () => {
    it('returns an Intl.DateTimeFormat instance', () => {
      const formatter = getDateFormatter()
      expect(formatter).toBeInstanceOf(Intl.DateTimeFormat)
    })

    it('returns cached formatter for same options', () => {
      const f1 = getDateFormatter()
      const f2 = getDateFormatter()
      expect(f1).toBe(f2)
    })
  })
})
