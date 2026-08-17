const BYTE_UNITS = ['B', 'KB', 'MB', 'GB'] as const

/** Formats a byte count into a human readable string. */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B'
  if (bytes === 0) return '0 B'

  const factor = 1024
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(factor)), BYTE_UNITS.length - 1)

  const value = bytes / factor ** unitIndex
  const rounded = Number(value.toFixed(decimals))
  const unit = BYTE_UNITS[unitIndex] ?? 'B'

  return `${rounded} ${unit}`
}

/** Clamps a value between a minimum and a maximum. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Formats a Date as a local ISO date string (YYYY-MM-DD). */
export function toISODate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Parses a YYYY-MM-DD string into a local Date (null when invalid). */
export function parseISODate(value: string | null | undefined): Date | null {
  if (!value) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  if (month < 0 || month > 11 || day < 1 || day > 31) return null

  const date = new Date(year, month, day)
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null
  }
  return date
}

/** Creates a short unique id (crypto-random when available). */
export function createId(prefix: string): string {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  return `${prefix}-${random}`
}
