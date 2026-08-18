import { describe, it, expect } from 'vitest'
import Decimal from 'decimal.js'
import {
  money,
  moneyAdd,
  moneySub,
  moneyMul,
  moneyPercent,
  moneyNegate,
  moneyRound,
  toNumber,
  formatMoney,
} from '@/core/utils/currency'

describe('currency utilities', () => {
  describe('money', () => {
    it('creates Decimal from number', () => {
      expect(money(100).equals(new Decimal(100))).toBe(true)
    })

    it('creates Decimal from string', () => {
      expect(money('123.45').equals(new Decimal('123.45'))).toBe(true)
    })

    it('creates Decimal from another Decimal', () => {
      const d = new Decimal(42)
      expect(money(d).equals(d)).toBe(true)
    })

    it('returns Decimal(0) for null', () => {
      expect(money(null).equals(new Decimal(0))).toBe(true)
    })

    it('returns Decimal(0) for undefined', () => {
      expect(money(undefined).equals(new Decimal(0))).toBe(true)
    })
  })

  describe('moneyAdd', () => {
    it('adds two numbers', () => {
      expect(moneyAdd(10, 20).equals(new Decimal(30))).toBe(true)
    })

    it('adds multiple numbers', () => {
      expect(moneyAdd(1, 2, 3, 4).equals(new Decimal(10))).toBe(true)
    })

    it('adds zero values', () => {
      expect(moneyAdd(0, 0, 0).equals(new Decimal(0))).toBe(true)
    })

    it('adds with decimal precision', () => {
      expect(moneyAdd('0.1', '0.2').equals(new Decimal('0.3'))).toBe(true)
    })

    it('adds with no arguments', () => {
      expect(moneyAdd().equals(new Decimal(0))).toBe(true)
    })
  })

  describe('moneySub', () => {
    it('subtracts b from a', () => {
      expect(moneySub(100, 30).equals(new Decimal(70))).toBe(true)
    })

    it('handles negative results', () => {
      expect(moneySub(10, 20).equals(new Decimal(-10))).toBe(true)
    })

    it('subtracts with decimals', () => {
      expect(moneySub('1.00', '0.01').equals(new Decimal('0.99'))).toBe(true)
    })
  })

  describe('moneyMul', () => {
    it('multiplies two numbers', () => {
      expect(moneyMul(5, 3).equals(new Decimal(15))).toBe(true)
    })

    it('multiplies with decimals', () => {
      expect(moneyMul(100, 0.15).equals(new Decimal(15))).toBe(true)
    })

    it('multiplies by zero', () => {
      expect(moneyMul(100, 0).equals(new Decimal(0))).toBe(true)
    })

    it('handles string inputs', () => {
      expect(moneyMul('10.5', '2').equals(new Decimal(21))).toBe(true)
    })
  })

  describe('moneyPercent', () => {
    it('calculates 10% of 1000', () => {
      expect(moneyPercent(1000, 10).equals(new Decimal(100))).toBe(true)
    })

    it('calculates 15% of 200', () => {
      expect(moneyPercent(200, 15).equals(new Decimal(30))).toBe(true)
    })

    it('handles 0%', () => {
      expect(moneyPercent(500, 0).equals(new Decimal(0))).toBe(true)
    })
  })

  describe('moneyNegate', () => {
    it('negates positive value', () => {
      expect(moneyNegate(100).equals(new Decimal(-100))).toBe(true)
    })

    it('negates negative value', () => {
      expect(moneyNegate(-50).equals(new Decimal(50))).toBe(true)
    })

    it('negates zero', () => {
      expect(moneyNegate(0).equals(new Decimal(0))).toBe(true)
    })
  })

  describe('moneyRound', () => {
    it('rounds to 2 decimal places by default', () => {
      expect(moneyRound(new Decimal('1.235'))).toEqual(new Decimal('1.24'))
    })

    it('rounds to specified places', () => {
      expect(moneyRound(new Decimal('1.2345'), 3)).toEqual(new Decimal('1.235'))
    })

    it('rounds already rounded values', () => {
      expect(moneyRound(new Decimal('1.23'))).toEqual(new Decimal('1.23'))
    })
  })

  describe('toNumber', () => {
    it('converts Decimal to number', () => {
      expect(toNumber(new Decimal(42))).toBe(42)
    })

    it('converts Decimal with decimals to number', () => {
      expect(toNumber(new Decimal('99.99'))).toBe(99.99)
    })
  })

  describe('formatMoney', () => {
    it('formats with default currency SAR', () => {
      const result = formatMoney(1234.56)
      expect(result).toContain('1,234.56')
      expect(result).toContain('SAR')
    })

    it('formats with custom locale', () => {
      const result = formatMoney(1000, 'SAR', 'ar-SA')
      expect(typeof result).toBe('string')
    })
  })
})
