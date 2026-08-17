/**
 * AuditService — business-layer facade for the audit trail.
 *
 * Audit records are append-only; no update or delete is exposed here.
 */

import { AuditLog, type AuditLogInput } from '../models/AuditLog'
import { AuditRepository } from '../repositories/AuditRepository'
import type { FindOptions } from '../repositories/BaseRepository'

export class AuditService {
  private readonly repository = new AuditRepository()

  record(entry: AuditLogInput): AuditLog {
    return this.repository.create(entry)
  }

  findByUserId(userId: string, options?: FindOptions): AuditLog[] {
    return this.repository.findByUserId(userId, options)
  }

  findByDateRange(from: Date, to: Date, options?: FindOptions): AuditLog[] {
    return this.repository.findByDateRange(from, to, options)
  }

  findRecent(limit = 50, options?: FindOptions): AuditLog[] {
    return this.repository.findRecent(limit, options)
  }

  countFailures(): number {
    return this.repository.countFailures()
  }
}
