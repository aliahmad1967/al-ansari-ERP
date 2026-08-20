import { describe, it, expect } from 'vitest'
import Decimal from 'decimal.js'
import { clamp, prorate, daysBetween, yearMonth } from '@/core/utils/numbers'

describe('numbers utilities', () => {
  describe('clamp', () => {
    it('clamps value below min', () => {
      expect(clamp(-5, 0, 10)).toBe(0)
    })

    it('clamps value above max', () => {
      expect(clamp(15, 0, 10)).toBe(10)
    })

    it('returns value within range', () => {
      expect(clamp(5, 0, 10)).toBe(5)
    })

    it('returns min when value equals min', () => {
      expect(clamp(0, 0, 10)).toBe(0)
    })

    it('returns max when value equals max', () => {
      expect(clamp(10, 0, 10)).toBe(10)
    })
  })

  describe('prorate', () => {
    it('calculates prorated amount for full period', () => {
      const result = prorate(3000, 30, 30)
      expect(result.equals(new Decimal(3000))).toBe(true)
    })

    it('calculates prorated amount for half period', () => {
      const result = prorate(3000, 15, 30)
      expect(result.equals(new Decimal(1500))).toBe(true)
    })

    it('handles zero days worked', () => {
      const result = prorate(3000, 0, 30)
      expect(result.equals(new Decimal(0))).toBe(true)
    })

    it('returns zero when totalDays is zero', () => {
      const result = prorate(3000, 5, 0)
      expect(result.equals(new Decimal(0))).toBe(true)
    })

    it('returns zero when totalDays is negative', () => {
      const result = prorate(3000, 5, -1)
      expect(result.equals(new Decimal(0))).toBe(true)
    })

    it('rounds to 2 decimal places', () => {
      const result = prorate(1000, 1, 3)
      expect(result.equals(new Decimal('333.33'))).toBe(true)
    })

    it('handles string input', () => {
      const result = prorate('3000', 15, 30)
      expect(result.equals(new Decimal(1500))).toBe(true)
    })
  })

  describe('daysBetween', () => {
    it('returns 1 for same day', () => {
      const d = new Date(2025, 0, 15)
      expect(daysBetween(d, d)).toBe(1)
    })

    it('returns correct count for different days', () => {
      const start = new Date(2025, 0, 1)
      const end = new Date(2025, 0, 5)
      expect(daysBetween(start, end)).toBe(5)
    })

    it('returns positive count for reversed dates', () => {
      const start = new Date(2025, 0, 10)
      const end = new Date(2025, 0, 5)
      expect(daysBetween(start, end)).toBe(-4)
    })

    it('handles month boundaries', () => {
      const start = new Date(2025, 0, 30)
      const end = new Date(2025, 1, 2)
      expect(daysBetween(start, end)).toBe(4)
    })
  })

  describe('yearMonth', () => {
    it('extracts year and month', () => {
      const date = new Date(2025, 5, 15)
      expect(yearMonth(date)).toEqual({ year: 2025, month: 6 })
    })

    it('handles January', () => {
      const date = new Date(2024, 0, 1)
      expect(yearMonth(date)).toEqual({ year: 2024, month: 1 })
    })

    it('handles December', () => {
      const date = new Date(2024, 11, 31)
      expect(yearMonth(date)).toEqual({ year: 2024, month: 12 })
    })
  })
})
