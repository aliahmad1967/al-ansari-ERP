import { describe, it, expect } from 'vitest'
import {
  formatBytes,
  clamp,
  toISODate,
  parseISODate,
  createId,
} from '@/lib/utils'

describe('lib utilities', () => {
  describe('formatBytes', () => {
    it('formats 0 bytes', () => {
      expect(formatBytes(0)).toBe('0 B')
    })

    it('formats bytes', () => {
      expect(formatBytes(500)).toBe('500 B')
    })

    it('formats kilobytes', () => {
      expect(formatBytes(1024)).toBe('1 KB')
    })

    it('formats megabytes', () => {
      expect(formatBytes(1048576)).toBe('1 MB')
    })

    it('handles negative input', () => {
      expect(formatBytes(-1)).toBe('0 B')
    })

    it('handles NaN', () => {
      expect(formatBytes(NaN)).toBe('0 B')
    })
  })

  describe('clamp', () => {
    it('clamps below min', () => {
      expect(clamp(-5, 0, 10)).toBe(0)
    })

    it('clamps above max', () => {
      expect(clamp(15, 0, 10)).toBe(10)
    })

    it('returns value in range', () => {
      expect(clamp(5, 0, 10)).toBe(5)
    })
  })

  describe('toISODate', () => {
    it('formats date as YYYY-MM-DD', () => {
      expect(toISODate(new Date(2025, 0, 5))).toBe('2025-01-05')
    })

    it('pads month and day', () => {
      expect(toISODate(new Date(2025, 0, 1))).toBe('2025-01-01')
    })

    it('handles December', () => {
      expect(toISODate(new Date(2025, 11, 25))).toBe('2025-12-25')
    })
  })

  describe('parseISODate', () => {
    it('parses a valid date string', () => {
      const date = parseISODate('2025-06-15')
      expect(date).toBeInstanceOf(Date)
      expect(date?.getFullYear()).toBe(2025)
      expect(date?.getMonth()).toBe(5)
      expect(date?.getDate()).toBe(15)
    })

    it('returns null for invalid format', () => {
      expect(parseISODate('not-a-date')).toBeNull()
    })

    it('returns null for empty string', () => {
      expect(parseISODate('')).toBeNull()
    })

    it('returns null for null', () => {
      expect(parseISODate(null)).toBeNull()
    })

    it('returns null for undefined', () => {
      expect(parseISODate(undefined)).toBeNull()
    })

    it('returns null for invalid date values', () => {
      expect(parseISODate('2025-13-01')).toBeNull()
    })
  })

  describe('createId', () => {
    it('creates a prefixed ID', () => {
      const id = createId('test')
      expect(id.startsWith('test-')).toBe(true)
    })

    it('creates unique IDs', () => {
      const ids = new Set(Array.from({ length: 50 }, () => createId('id')))
      expect(ids.size).toBe(50)
    })
  })
})
