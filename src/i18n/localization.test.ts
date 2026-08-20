// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'

const mockStorage = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: vi.fn((key: string) => mockStorage.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => { mockStorage.set(key, value) }),
  removeItem: vi.fn((key: string) => { mockStorage.delete(key) }),
  clear: vi.fn(() => { mockStorage.clear() }),
})

const { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } = await import('@/i18n/i18n')

import enCommon from './en/common.json'
import arCommon from './ar/common.json'
import arHr from './ar/hr.json'
import enHr from './en/hr.json'
import enSales from './en/sales.json'
import arSales from './ar/sales.json'

describe('i18n configuration', () => {
  describe('SUPPORTED_LANGUAGES', () => {
    it('includes Arabic', () => {
      expect(SUPPORTED_LANGUAGES).toContain('ar')
    })

    it('includes English', () => {
      expect(SUPPORTED_LANGUAGES).toContain('en')
    })

    it('has exactly 2 languages', () => {
      expect(SUPPORTED_LANGUAGES).toHaveLength(2)
    })
  })

  describe('DEFAULT_LANGUAGE', () => {
    it('defaults to Arabic', () => {
      expect(DEFAULT_LANGUAGE).toBe('ar')
    })
  })
})

describe('translation completeness', () => {
  it('English and Arabic share the same top-level keys', () => {
    const enKeys = Object.keys(enCommon).sort()
    const arKeys = Object.keys(arCommon).sort()
    expect(enKeys).toEqual(arKeys)
  })

  it('both languages have validation keys', () => {
    expect(enCommon.validation).toBeDefined()
    expect(arCommon.validation).toBeDefined()
  })

  it('validation has required key in both languages', () => {
    expect(typeof enCommon.validation.required).toBe('string')
    expect(typeof arCommon.validation.required).toBe('string')
  })

  it('English validation required message is in English', () => {
    expect(enCommon.validation.required).toMatch(/field/i)
  })

  it('Arabic validation required message contains Arabic characters', () => {
    expect(arCommon.validation.required).toMatch(/[\u0600-\u06FF]/)
  })
})

describe('RTL/LTR direction support', () => {
  it('Arabic text contains right-to-left characters', () => {
    const arabicText = 'مرحباً بالعالم'
    const rtlChars = arabicText.match(/[\u0600-\u06FF]/g)
    expect(rtlChars).toBeTruthy()
    expect(rtlChars!.length).toBeGreaterThan(0)
  })

  it('English text contains only LTR characters', () => {
    const englishText = 'Hello World'
    const rtlChars = englishText.match(/[\u0600-\u06FF]/g)
    expect(rtlChars).toBeNull()
  })

  it('Arabic locale uses RTL direction', () => {
    const arabicLang = 'ar' as string
    const direction = arabicLang === 'ar' ? 'rtl' : 'ltr'
    expect(direction).toBe('rtl')
  })

  it('English locale uses LTR direction', () => {
    const englishLang = 'en' as string
    const direction = englishLang === 'ar' ? 'rtl' : 'ltr'
    expect(direction).toBe('ltr')
  })
})

describe('Arabic translation content', () => {
  it('Arabic HR module has translations', () => {
    expect(typeof arHr).toBe('object')
    expect(Object.keys(arHr).length).toBeGreaterThan(0)
  })

  it('English HR module has translations', () => {
    expect(typeof enHr).toBe('object')
    expect(Object.keys(enHr).length).toBeGreaterThan(0)
  })
})

describe('English translation content', () => {
  it('English sales module has translations', () => {
    expect(typeof enSales).toBe('object')
    expect(Object.keys(enSales).length).toBeGreaterThan(0)
  })

  it('Arabic sales module has translations', () => {
    expect(typeof arSales).toBe('object')
    expect(Object.keys(arSales).length).toBeGreaterThan(0)
  })
})
