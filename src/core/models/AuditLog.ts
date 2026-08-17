/**
 * AuditLog — immutable trail of significant ERP operations.
 *
 * Audit entries are never updated or deleted after they are written. This model
 * intentionally has no soft-delete fields so the audit trail stays permanent.
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

export interface AuditLogInput {
  actorUserId?: string
  actorUsername?: string
  action: AuditActionValue | string
  module: string
  resourceType: string
  resourceId?: string
  summary: string
  details?: string
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
      ipAddress: { type: 'string', optional: true },
      userAgent: { type: 'string', optional: true },
      outcome: { type: 'string', default: AuditOutcome.Success },
      createdAt: { type: 'date', indexed: true },
    },
  }
}

/** Entity shape used by repositories (persisted fields only). */
export type AuditLogEntity = AuditLog & BaseEntityFields
