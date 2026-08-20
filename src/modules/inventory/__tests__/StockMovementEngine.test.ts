import { describe, it, expect } from 'vitest'
import {
  calculateStockMovement,
  calculateTransferCost,
  calculateAverageCost,
  isProductLowStock,
  isProductOutOfStock,
} from '@/modules/inventory/services/StockMovementEngine'

describe('StockMovementEngine', () => {
  describe('calculateStockMovement', () => {
    it('returns positive quantity for purchase', () => {
      const result = calculateStockMovement({
        type: 'purchase',
        productId: 'prod-001',
        warehouseId: 'wh-001',
        quantity: 100,
        unitCost: 10,
      })
      expect(result.quantity).toBe(100)
      expect(result.unitCost).toBe(10)
      expect(result.totalCost).toBe(1000)
      expect(result.isOutgoing).toBe(false)
    })

    it('returns negative quantity for sale', () => {
      const result = calculateStockMovement({
        type: 'sale',
        productId: 'prod-001',
        warehouseId: 'wh-001',
        quantity: 50,
        unitCost: 10,
      })
      expect(result.quantity).toBe(-50)
      expect(result.isOutgoing).toBe(true)
    })

    it('returns negative for transfer_out', () => {
      const result = calculateStockMovement({
        type: 'transfer_out',
        productId: 'prod-001',
        warehouseId: 'wh-001',
        quantity: 20,
        unitCost: 5,
      })
      expect(result.quantity).toBe(-20)
      expect(result.isOutgoing).toBe(true)
    })

    it('returns negative for adjustment_out', () => {
      const result = calculateStockMovement({
        type: 'adjustment_out',
        productId: 'prod-001',
        warehouseId: 'wh-001',
        quantity: 10,
        unitCost: 15,
      })
      expect(result.quantity).toBe(-10)
    })

    it('returns negative for return_out', () => {
      const result = calculateStockMovement({
        type: 'return_out',
        productId: 'prod-001',
        warehouseId: 'wh-001',
        quantity: 5,
        unitCost: 20,
      })
      expect(result.quantity).toBe(-5)
    })

    it('returns negative for damage', () => {
      const result = calculateStockMovement({
        type: 'damage',
        productId: 'prod-001',
        warehouseId: 'wh-001',
        quantity: 3,
        unitCost: 10,
      })
      expect(result.quantity).toBe(-3)
    })

    it('returns positive for transfer_in', () => {
      const result = calculateStockMovement({
        type: 'transfer_in',
        productId: 'prod-001',
        warehouseId: 'wh-001',
        quantity: 25,
        unitCost: 8,
      })
      expect(result.quantity).toBe(25)
      expect(result.isOutgoing).toBe(false)
    })

    it('returns positive for adjustment_in', () => {
      const result = calculateStockMovement({
        type: 'adjustment_in',
        productId: 'prod-001',
        warehouseId: 'wh-001',
        quantity: 15,
        unitCost: 12,
      })
      expect(result.quantity).toBe(15)
      expect(result.isOutgoing).toBe(false)
    })

    it('defaults unitCost to 0 when not provided', () => {
      const result = calculateStockMovement({
        type: 'purchase',
        productId: 'prod-001',
        warehouseId: 'wh-001',
        quantity: 10,
      })
      expect(result.unitCost).toBe(0)
      expect(result.totalCost).toBe(0)
    })
  })

  describe('calculateTransferCost', () => {
    it('multiplies quantity by unit cost', () => {
      expect(calculateTransferCost(10, 5).toNumber()).toBe(50)
    })

    it('handles zero quantity', () => {
      expect(calculateTransferCost(0, 100).toNumber()).toBe(0)
    })
  })

  describe('calculateAverageCost', () => {
    it('calculates weighted average', () => {
      const result = calculateAverageCost(100, 10, 50, 15)
      expect(result).toBe(11.67)
    })

    it('returns 0 when total quantity is zero', () => {
      expect(calculateAverageCost(0, 0, 0, 0)).toBe(0)
    })

    it('returns incoming cost when existing is zero', () => {
      expect(calculateAverageCost(0, 0, 100, 20)).toBe(20)
    })
  })

  describe('isProductLowStock', () => {
    it('returns true when at minimum', () => {
      expect(isProductLowStock(10, 10)).toBe(true)
    })

    it('returns true when below minimum', () => {
      expect(isProductLowStock(5, 10)).toBe(true)
    })

    it('returns false when above minimum', () => {
      expect(isProductLowStock(15, 10)).toBe(false)
    })
  })

  describe('isProductOutOfStock', () => {
    it('returns true when zero', () => {
      expect(isProductOutOfStock(0)).toBe(true)
    })

    it('returns true when negative', () => {
      expect(isProductOutOfStock(-5)).toBe(true)
    })

    it('returns false when positive', () => {
      expect(isProductOutOfStock(1)).toBe(false)
    })
  })
})
