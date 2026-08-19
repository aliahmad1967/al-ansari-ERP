import i18n from '@/i18n/i18n'
import { APP_CURRENCY } from '@/config/app.config'
import { parseISODate } from '@/lib/utils'

/**
 * Locale-aware formatting.
 *
 * All user-facing dates, numbers and currency amounts must be formatted through
 * this module so they adapt automatically to the active language (Arabic uses
 * Gregorian dates with Arabic-Indic digits via `ar-EG`, English uses `en-US`).
 */

const LOCALE_MAP: Record<string, string> = {
  ar: 'ar-EG',
  en: 'en-US',
}

/** Resolves an app language code to a BCP-47 locale tag. */
export function getLocale(language?: string): string {
  const resolved = language ?? 'ar'
  return LOCALE_MAP[resolved] ?? resolved
}

/** Locale of the currently active language. */
export function getCurrentLocale(): string {
  return getLocale(i18n.resolvedLanguage ?? i18n.language)
}

const numberFormatCache = new Map<string, Intl.NumberFormat>()

function getNumberFormatter(options?: Intl.NumberFormatOptions): Intl.NumberFormat {
  const locale = getCurrentLocale()
  const key = `${locale}:${JSON.stringify(options ?? null)}`
  const cached = numberFormatCache.get(key)
  if (cached) return cached
  const formatter = new Intl.NumberFormat(locale, options)
  numberFormatCache.set(key, formatter)
  return formatter
}

/** Formats a number for the active locale (Arabic uses Arabic-Indic digits). */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return getNumberFormatter(options).format(value)
}

/** Formats a currency amount using the app currency for the active locale. */
export function formatCurrency(
  value: number,
  currency: string = APP_CURRENCY,
  options: Intl.NumberFormatOptions = {},
): string {
  return formatNumber(value, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
    ...options,
  })
}

const dateFormatCache = new Map<string, Intl.DateTimeFormat>()

/** Returns a cached Intl.DateTimeFormat bound to the active locale. */
export function getDateFormatter(options?: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const locale = getCurrentLocale()
  const key = `${locale}:${JSON.stringify(options ?? null)}`
  const cached = dateFormatCache.get(key)
  if (cached) return cached
  const formatter = new Intl.DateTimeFormat(locale, options)
  dateFormatCache.set(key, formatter)
  return formatter
}

/** Formats a date for the active locale. Returns an empty string for invalid input. */
export function formatDate(
  value: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date =
    typeof value === 'string' ? (parseISODate(value) ?? new Date(value)) : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return getDateFormatter(options).format(date)
}

/** Formats a time for the active locale. Returns an empty string for invalid input. */
export function formatTime(
  value: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
): string {
  return formatDate(value, { hour: '2-digit', minute: '2-digit', ...options })
}

/** Formats bytes into a human-readable size string. */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const value = bytes / Math.pow(k, i)
  return `${value.toFixed(decimals)} ${sizes[i]}`
}
