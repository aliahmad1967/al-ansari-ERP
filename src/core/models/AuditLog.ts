/**
 * AuditLog — immutable trail of significant ERP operations.
 *
 * Audit entries are never updated or deleted after they are written. This model
 * intentionally has no soft-delete fields so the audit trail stays permanent.
 *
 * SECURITY: Never log passwords, tokens, secrets, or full credit card numbers.
 * The `previousValue` and `newValue` fields store JSON snapshots but must be
 * sanitized before persistence to strip sensitive fields.
 */

import Realm from 'realm'

import { BASE_PROPERTIES, type BaseEntityFields } from './base'

export const AuditAction = {
  Create: 'create',
  Update: 'update',
  Delete: 'delete',
  Approve: 'approve',
  Reject: 'reject',
  Post: 'post',
  Cancel: 'cancel',
  Login: 'login',
  Logout: 'logout',
  Import: 'import',
  Export: 'export',
  Backup: 'backup',
  Restore: 'restore',
  Reset: 'reset',
  Seed: 'seed',
} as const

export type AuditActionValue = (typeof AuditAction)[keyof typeof AuditAction]

export const AuditOutcome = {
  Success: 'success',
  Failure: 'failure',
} as const

export type AuditOutcomeValue = (typeof AuditOutcome)[keyof typeof AuditOutcome]

/** Fields that must never be stored in audit snapshots. */
const SENSITIVE_FIELDS = new Set([
  'password',
  'passwordHash',
  'oldPassword',
  'newPassword',
  'token',
  'secret',
  'apiKey',
  'accessToken',
  'refreshToken',
  'creditCard',
  'ssn',
  'taxId',
])

/**
 * Strips sensitive fields from a snapshot object before storing in the audit log.
 * Returns a JSON-safe string, or null if the input is empty after sanitization.
 */
function sanitizeSnapshot(data: Record<string, unknown> | null | undefined): string | null {
  if (!data) return null
  const sanitized: Record<string, unknown> = {}
  let hasFields = false
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_FIELDS.has(key)) {
      sanitized[key] = '[REDACTED]'
    } else {
      sanitized[key] = value
    }
    hasFields = true
  }
  return hasFields ? JSON.stringify(sanitized) : null
}

export interface AuditLogInput {
  actorUserId?: string
  actorUsername?: string
  action: AuditActionValue | string
  module: string
  resourceType: string
  resourceId?: string
  summary: string
  details?: string
  /** JSON snapshot of the record before the change (for updates/deletes). */
  previousValue?: Record<string, unknown> | null
  /** JSON snapshot of the record after the change (for creates/updates). */
  newValue?: Record<string, unknown> | null
  /** Reason for the operation (required for destructive ops like delete/reset). */
  reason?: string
  ipAddress?: string
  userAgent?: string
  outcome?: AuditOutcomeValue
}

export class AuditLog extends Realm.Object<AuditLog> {
  declare _id: string
  declare actorUserId: string | null
  declare actorUsername: string | null
  declare action: string
  declare module: string
  declare resourceType: string
  declare resourceId: string | null
  declare summary: string
  declare details: string | null
  /** JSON snapshot before the change — sensitive fields are redacted. */
  declare previousValue: string | null
  /** JSON snapshot after the change — sensitive fields are redacted. */
  declare newValue: string | null
  /** Reason for the operation (required for destructive ops). */
  declare reason: string | null
  declare ipAddress: string | null
  declare userAgent: string | null
  declare outcome: string
  declare createdAt: Date
  declare updatedAt: Date

  static schema: Realm.ObjectSchema = {
    name: 'AuditLog',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      actorUserId: { type: 'string', optional: true },
      actorUsername: { type: 'string', optional: true },
      action: { type: 'string', indexed: true },
      module: { type: 'string', indexed: true },
      resourceType: 'string',
      resourceId: { type: 'string', optional: true },
      summary: 'string',
      details: { type: 'string', optional: true },
      previousValue: { type: 'string', optional: true },
      newValue: { type: 'string', optional: true },
      reason: { type: 'string', optional: true },
      ipAddress: { type: 'string', optional: true },
      userAgent: { type: 'string', optional: true },
      outcome: { type: 'string', default: AuditOutcome.Success },
      createdAt: { type: 'date', indexed: true },
    },
  }
}

/** Entity shape used by repositories (persisted fields only). */
export type AuditLogEntity = AuditLog & BaseEntityFields

export { sanitizeSnapshot }
