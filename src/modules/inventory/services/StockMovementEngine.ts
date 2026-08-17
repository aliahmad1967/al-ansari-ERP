/**
 * StockMovementEngine — core calculation engine for stock movements.
 *
 * All stock quantity and cost calculations MUST go through this module
 * to ensure decimal-safe arithmetic. Never use raw floating-point
 * operators for inventory financial calculations.
 *
 * Calculation flow:
 *   1. Determine movement direction (incoming vs outgoing)
 *   2. Calculate total cost = quantity × unit cost
 *   3. For incoming movements, recalculate weighted average cost
 *   4. Validate stock levels against minimum thresholds
 */

import {
  moneyAdd,
  moneyMul,
  moneyNegate,
  moneyRound,
  toNumber,
} from '@/core/utils/currency'
import Decimal from 'decimal.js'

export interface MovementCalculationInput {
  type: string
  productId: string
  warehouseId: string
  locationId?: string
  quantity: number
  unitCost?: number
  referenceType?: string
  referenceId?: string
  referenceNumber?: string
  batchNumber?: string
  expiryDate?: Date
  notes?: string
}

export interface MovementCalculationResult {
  quantity: number
  unitCost: number
  totalCost: number
  isOutgoing: boolean
}

const OUTGOING_TYPES = ['sale', 'transfer_out', 'adjustment_out', 'return_out', 'damage']

/**
 * Calculates the signed quantity and total cost for a stock movement.
 *
 * Outgoing movements (sale, transfer out, adjustment out, return out, damage)
 * produce a negative quantity to reduce the stock balance.
 */
export function calculateStockMovement(
  input: MovementCalculationInput,
): MovementCalculationResult {
  const qty = new Decimal(input.quantity)
  const unitCost = input.unitCost != null ? new Decimal(input.unitCost) : new Decimal(0)
  const totalCost = moneyMul(qty, unitCost)
  const isOutgoing = OUTGOING_TYPES.includes(input.type)

  return {
    quantity: toNumber(isOutgoing ? moneyNegate(qty) : qty),
    unitCost: toNumber(unitCost),
    totalCost: toNumber(totalCost),
    isOutgoing,
  }
}

/**
 * Calculates the total cost for a transfer line item.
 */
export function calculateTransferCost(
  quantity: number,
  unitCost: number,
): Decimal {
  return moneyMul(quantity, unitCost)
}

/**
 * Calculates the weighted average cost per unit after an incoming movement.
 *
 * Uses the formula:
 *   newAvgCost = (existingQty × existingCost + incomingQty × incomingCost)
 *                / (existingQty + incomingQty)
 *
 * Returns 0 when total quantity is zero to avoid division by zero.
 */
export function calculateAverageCost(
  existingQuantity: number,
  existingCost: number,
  incomingQuantity: number,
  incomingCost: number,
): number {
  const existingTotal = moneyMul(existingQuantity, existingCost)
  const incomingTotal = moneyMul(incomingQuantity, incomingCost)
  const totalQty = new Decimal(existingQuantity).plus(incomingQuantity)

  if (totalQty.isZero()) return 0

  return toNumber(moneyRound(moneyAdd(existingTotal, incomingTotal).div(totalQty)))
}

/**
 * Returns true when the current quantity is at or below the minimum stock level.
 */
export function isProductLowStock(
  currentQuantity: number,
  minimumStock: number,
): boolean {
  return new Decimal(currentQuantity).lte(minimumStock)
}

/**
 * Returns true when the current quantity is zero or negative.
 */
export function isProductOutOfStock(currentQuantity: number): boolean {
  return new Decimal(currentQuantity).lte(0)
}
