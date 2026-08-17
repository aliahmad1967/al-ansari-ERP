/**
 * Currency and monetary calculation utilities.
 *
 * All financial calculations MUST go through this module to ensure
 * decimal-safe arithmetic. Never use raw floating-point operators
 * (+, -, *, /) for money values.
 */

import Decimal from 'decimal.js'

/** Configure Decimal.js for financial precision (2 decimal places). */
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP })

/**
 * Creates a Decimal from a money value. Handles numbers, strings,
 * and null/undefined gracefully.
 */
export function money(value: number | string | Decimal | null | undefined): Decimal {
  if (value === null || value === undefined) return new Decimal(0)
  return new Decimal(value)
}

/** Adds two or more monetary values. */
export function moneyAdd(...values: Array<number | string | Decimal>): Decimal {
  return values.reduce<Decimal>((sum, v) => sum.plus(money(v)), new Decimal(0))
}

/** Subtracts b from a. */
export function moneySub(
  a: number | string | Decimal,
  b: number | string | Decimal,
): Decimal {
  return money(a).minus(money(b))
}

/** Multiplies a monetary value by a factor. */
export function moneyMul(
  value: number | string | Decimal,
  factor: number | string | Decimal,
): Decimal {
  return money(value).times(money(factor))
}

/**
 * Calculates a percentage of a base amount.
 *
 * @example moneyPercent(1000, 10) => 100  (10% of 1000)
 */
export function moneyPercent(
  base: number | string | Decimal,
  percentage: number | string | Decimal,
): Decimal {
  return money(base).times(money(percentage)).div(100)
}

/** Negates a monetary value. */
export function moneyNegate(value: number | string | Decimal): Decimal {
  return money(value).neg()
}

/** Rounds a monetary value to the specified decimal places (default 2). */
export function moneyRound(value: Decimal, places = 2): Decimal {
  return value.toDecimalPlaces(places, Decimal.ROUND_HALF_UP)
}

/** Converts a Decimal to a plain number for storage in Realm. */
export function toNumber(value: Decimal): number {
  return value.toNumber()
}

/** Formats a money value with thousands separators and fixed decimals. */
export function formatMoney(
  value: number | string | Decimal,
  currency = 'SAR',
  locale = 'en-US',
): string {
  const num = money(value).toNumber()
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}
