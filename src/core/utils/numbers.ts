/**
 * Numeric utilities for precise calculations.
 *
 * Uses decimal.js under the hood via the currency utilities.
 * Prefer importing from currency.ts for monetary operations.
 */

import Decimal from 'decimal.js'

import { money, moneyRound } from './currency'

/** Clamps a number between min and max (inclusive). */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Calculates a prorated amount based on days worked within a period.
 *
 * @param totalAmount - The full period amount
 * @param daysWorked - Days the employee worked in the period
 * @param totalDays - Total calendar days in the period
 * @returns Prorated amount rounded to 2 decimal places
 */
export function prorate(
  totalAmount: number | string | Decimal,
  daysWorked: number,
  totalDays: number,
): Decimal {
  if (totalDays <= 0) return money(0)
  return moneyRound(money(totalAmount).times(daysWorked).div(totalDays))
}

/**
 * Calculates the number of calendar days between two dates (inclusive).
 */
export function daysBetween(start: Date, end: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000
  const diff = end.getTime() - start.getTime()
  return Math.floor(diff / msPerDay) + 1
}

/**
 * Extracts year and month from a Date.
 */
export function yearMonth(date: Date): { year: number; month: number } {
  return { year: date.getFullYear(), month: date.getMonth() + 1 }
}
