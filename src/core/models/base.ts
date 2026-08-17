/**
 * Shared building blocks for Realm models.
 *
 * Every entity carries:
 *  - a stable string primary key (`_id`),
 *  - `createdAt` / `updatedAt` timestamps,
 *  - soft-delete fields where appropriate (`isDeleted` + `deletedAt`).
 *
 * Timestamps are managed by the repository layer, never by UI code.
 */

import type Realm from 'realm'

import { newId } from '../utils/generators'

export interface BaseEntityFields {
  createdAt: Date
  updatedAt: Date
}

export interface SoftDeletableEntityFields extends BaseEntityFields {
  isDeleted: boolean
  deletedAt: Date | null
}

/** Generates a new stable primary key. */
export function newEntityId(): string {
  return newId()
}

/** Creates the standard timestamp fields for a new record. */
export function newEntityFields(): BaseEntityFields {
  const now = new Date()
  return { createdAt: now, updatedAt: now }
}

/** Creates the standard timestamp + soft-delete fields for a new record. */
export function newSoftDeletableFields(): SoftDeletableEntityFields {
  return { ...newEntityFields(), isDeleted: false, deletedAt: null }
}

/** Returns the timestamp to write when a record is modified. */
export function touchedFields(): { updatedAt: Date } {
  return { updatedAt: new Date() }
}

/** Property schema shared by every entity. */
export const BASE_PROPERTIES = {
  _id: { type: 'string' },
  createdAt: { type: 'date' },
  updatedAt: { type: 'date' },
} as const satisfies Record<string, Realm.PropertySchema>

/** Property schema shared by every soft-deletable entity. */
export const SOFT_DELETE_PROPERTIES = {
  isDeleted: { type: 'bool', default: false },
  deletedAt: { type: 'date', optional: true },
} as const satisfies Record<string, Realm.PropertySchema>
