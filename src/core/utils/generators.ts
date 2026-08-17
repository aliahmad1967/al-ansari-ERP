import { randomUUID } from 'node:crypto'

/**
 * Generators for stable identifiers and document numbering.
 *
 * All entities use string primary keys so the identifiers remain stable across
 * schema versions, exports and future synchronization layers.
 */

/** Returns a new stable universally-unique identifier (UUID v4). */
export function newId(): string {
  return randomUUID()
}

/** Returns a namespaced identifier, e.g. `branch_b1a2...`. */
export function newPrefixedId(prefix: string): string {
  return `${prefix}_${randomUUID()}`
}

/** Returns a document number using a prefix and a sequence, e.g. `INV-000123`. */
export function newDocumentNumber(prefix: string, sequence: number, width = 6): string {
  const padded = String(sequence).padStart(width, '0')
  return `${prefix}-${padded}`
}

/** Returns a short human-friendly identifier, e.g. `ORG-4f2c`. */
export function newShortId(prefix: string, length = 6): string {
  const suffix = randomUUID().replace(/-/g, '').slice(0, length)
  return `${prefix}-${suffix}`
}
