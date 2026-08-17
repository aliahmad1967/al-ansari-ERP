/**
 * AuditRepository — persistence for the immutable {@link AuditLog} trail.
 *
 * Audit entries are write-only: no update or delete is exposed. Records are
 * never soft-deleted.
 */

import { AuditLog, AuditOutcome, type AuditLogInput } from '../models/AuditLog'
import {
  maxLength,
  oneOf,
  required,
  validateFields,
  type ValidationIssue,
} from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

const ALLOWED_ACTIONS = [
  'create',
  'update',
  'delete',
  'approve',
  'reject',
  'post',
  'cancel',
  'login',
  'logout',
  'import',
  'export',
  'backup',
  'restore',
  'reset',
  'seed',
] as const

export class AuditRepository extends BaseRepository<AuditLog, AuditLogInput> {
  protected get objectType(): string {
    return 'AuditLog'
  }

  protected get modelClass(): ModelConstructor<AuditLog> {
    return AuditLog
  }

  protected get supportsSoftDelete(): boolean {
    return false
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      action: oneOf('Action', ALLOWED_ACTIONS),
      module: required('Module'),
      resourceType: required('Resource type'),
      summary: required('Summary'),
      actorUsername: maxLength('Actor username', 128),
    })
  }

  findByUserId(userId: string, options: FindOptions = {}): AuditLog[] {
    return this.query('actorUserId == $0', [userId], {
      ...options,
      sortBy: 'createdAt',
      sortAscending: false,
    })
  }

  findByUsername(username: string, options: FindOptions = {}): AuditLog[] {
    return this.query('actorUsername == $0', [username], {
      ...options,
      sortBy: 'createdAt',
      sortAscending: false,
    })
  }

  findByAction(action: string, options: FindOptions = {}): AuditLog[] {
    return this.query('action == $0', [action], {
      ...options,
      sortBy: 'createdAt',
      sortAscending: false,
    })
  }

  findByModule(module: string, options: FindOptions = {}): AuditLog[] {
    return this.query('module == $0', [module], {
      ...options,
      sortBy: 'createdAt',
      sortAscending: false,
    })
  }

  findByResource(resourceType: string, options: FindOptions = {}): AuditLog[] {
    return this.query('resourceType == $0', [resourceType], {
      ...options,
      sortBy: 'createdAt',
      sortAscending: false,
    })
  }

  findByDateRange(from: Date, to: Date, options: FindOptions = {}): AuditLog[] {
    return this.query('createdAt >= $0 AND createdAt <= $1', [from, to], {
      ...options,
      sortBy: 'createdAt',
      sortAscending: false,
    })
  }

  /** The most recent audit entries. */
  findRecent(limit = 50, options: FindOptions = {}): AuditLog[] {
    return this.query(null, [], { ...options, sortBy: 'createdAt', sortAscending: false, limit })
  }

  /** Count of failed operations in the log. */
  countFailures(): number {
    return this.countQuery('outcome == $0', [AuditOutcome.Failure], { includeDeleted: true })
  }
}
