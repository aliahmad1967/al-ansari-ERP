/**
 * AuditService — business-layer facade for the audit trail.
 *
 * Provides typed convenience methods for every auditable operation.
 * Audit records are append-only; no update or delete is exposed here.
 *
 * SECURITY: Never pass passwords, tokens, or secrets as previousValue/newValue.
 * Use `sanitizeSnapshot` from the AuditLog model to strip sensitive fields.
 */

import { AuditAction, AuditLog, AuditOutcome, type AuditLogInput, sanitizeSnapshot } from '../models/AuditLog'
import { AuditRepository } from '../repositories/AuditRepository'
import type { FindOptions } from '../repositories/BaseRepository'

export class AuditService {
  private readonly repository = new AuditRepository()

  // ── Generic ───────────────────────────────────────────────────────

  record(entry: AuditLogInput): AuditLog {
    const sanitized: AuditLogInput = {
      ...entry,
      previousValue: entry.previousValue ? sanitizeSnapshot(entry.previousValue) : entry.previousValue,
      newValue: entry.newValue ? sanitizeSnapshot(entry.newValue) : entry.newValue,
    }
    return this.repository.create(sanitized)
  }

  // ── CRUD operations ──────────────────────────────────────────────

  recordCreate(params: {
    module: string
    resourceType: string
    resourceId: string
    newValue: Record<string, unknown>
    actorUserId?: string
    actorUsername?: string
    summary?: string
  }): AuditLog {
    return this.record({
      action: AuditAction.Create,
      module: params.module,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      newValue: params.newValue,
      actorUserId: params.actorUserId,
      actorUsername: params.actorUsername,
      summary: params.summary ?? `Created ${params.resourceType} "${params.resourceId}"`,
    })
  }

  recordUpdate(params: {
    module: string
    resourceType: string
    resourceId: string
    previousValue: Record<string, unknown>
    newValue: Record<string, unknown>
    actorUserId?: string
    actorUsername?: string
    summary?: string
  }): AuditLog {
    return this.record({
      action: AuditAction.Update,
      module: params.module,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      previousValue: params.previousValue,
      newValue: params.newValue,
      actorUserId: params.actorUserId,
      actorUsername: params.actorUsername,
      summary: params.summary ?? `Updated ${params.resourceType} "${params.resourceId}"`,
    })
  }

  recordDelete(params: {
    module: string
    resourceType: string
    resourceId: string
    previousValue?: Record<string, unknown>
    reason: string
    actorUserId?: string
    actorUsername?: string
    summary?: string
  }): AuditLog {
    return this.record({
      action: AuditAction.Delete,
      module: params.module,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      previousValue: params.previousValue,
      reason: params.reason,
      actorUserId: params.actorUserId,
      actorUsername: params.actorUsername,
      summary: params.summary ?? `Deleted ${params.resourceType} "${params.resourceId}"`,
      outcome: AuditOutcome.Success,
    })
  }

  // ── Workflow operations ──────────────────────────────────────────

  recordApprove(params: {
    module: string
    resourceType: string
    resourceId: string
    actorUserId: string
    actorUsername: string
    summary?: string
  }): AuditLog {
    return this.record({
      action: AuditAction.Approve,
      module: params.module,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      actorUserId: params.actorUserId,
      actorUsername: params.actorUsername,
      summary: params.summary ?? `${params.resourceType} "${params.resourceId}" approved`,
    })
  }

  recordReject(params: {
    module: string
    resourceType: string
    resourceId: string
    reason: string
    actorUserId: string
    actorUsername: string
    summary?: string
  }): AuditLog {
    return this.record({
      action: AuditAction.Reject,
      module: params.module,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      reason: params.reason,
      actorUserId: params.actorUserId,
      actorUsername: params.actorUsername,
      summary: params.summary ?? `${params.resourceType} "${params.resourceId}" rejected: ${params.reason}`,
    })
  }

  recordPost(params: {
    module: string
    resourceType: string
    resourceId: string
    previousValue?: Record<string, unknown>
    newValue?: Record<string, unknown>
    actorUserId: string
    actorUsername: string
    summary?: string
  }): AuditLog {
    return this.record({
      action: AuditAction.Post,
      module: params.module,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      previousValue: params.previousValue,
      newValue: params.newValue,
      actorUserId: params.actorUserId,
      actorUsername: params.actorUsername,
      summary: params.summary ?? `${params.resourceType} "${params.resourceId}" posted`,
    })
  }

  // ── Authentication ───────────────────────────────────────────────

  recordLogin(params: {
    username: string
    success: boolean
    reason?: string
    actorUserId?: string
    ipAddress?: string
    userAgent?: string
  }): AuditLog {
    return this.record({
      action: AuditAction.Login,
      module: 'auth',
      resourceType: 'User',
      actorUserId: params.actorUserId,
      actorUsername: params.username,
      summary: params.success
        ? `User "${params.username}" logged in successfully`
        : `Login attempt for "${params.username}": ${params.reason ?? 'Invalid credentials'}`,
      outcome: params.success ? AuditOutcome.Success : AuditOutcome.Failure,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    })
  }

  recordLogout(params: {
    userId: string
    username: string
  }): AuditLog {
    return this.record({
      action: AuditAction.Logout,
      module: 'auth',
      resourceType: 'User',
      resourceId: params.userId,
      actorUserId: params.userId,
      actorUsername: params.username,
      summary: `User "${params.username}" logged out`,
      outcome: AuditOutcome.Success,
    })
  }

  // ── Data operations ──────────────────────────────────────────────

  recordImport(params: {
    resourceType: string
    recordCount: number
    skipped: number
    actorUserId?: string
    actorUsername?: string
    success: boolean
    error?: string
  }): AuditLog {
    return this.record({
      action: AuditAction.Import,
      module: 'settings',
      resourceType: params.resourceType,
      actorUserId: params.actorUserId,
      actorUsername: params.actorUsername,
      summary: params.success
        ? `Imported ${params.recordCount} records into ${params.resourceType} (${params.skipped} skipped)`
        : `Import failed for ${params.resourceType}: ${params.error ?? 'Unknown error'}`,
      outcome: params.success ? AuditOutcome.Success : AuditOutcome.Failure,
    })
  }

  recordExport(params: {
    fileType: string
    recordCount: number
    filename: string
    actorUserId?: string
    actorUsername?: string
    success: boolean
    error?: string
  }): AuditLog {
    return this.record({
      action: AuditAction.Export,
      module: 'settings',
      resourceType: 'Database',
      actorUserId: params.actorUserId,
      actorUsername: params.actorUsername,
      summary: params.success
        ? `Exported ${params.recordCount} records to ${params.fileType} (${params.filename})`
        : `Export failed: ${params.error ?? 'Unknown error'}`,
      outcome: params.success ? AuditOutcome.Success : AuditOutcome.Failure,
    })
  }

  recordBackup(params: {
    filename: string
    sizeBytes: number
    actorUserId?: string
    actorUsername?: string
    success: boolean
    error?: string
  }): AuditLog {
    return this.record({
      action: AuditAction.Backup,
      module: 'settings',
      resourceType: 'Database',
      actorUserId: params.actorUserId,
      actorUsername: params.actorUsername,
      summary: params.success
        ? `Backup created: ${params.filename} (${params.sizeBytes} bytes)`
        : `Backup failed: ${params.error ?? 'Unknown error'}`,
      outcome: params.success ? AuditOutcome.Success : AuditOutcome.Failure,
    })
  }

  recordRestore(params: {
    filename: string
    actorUserId?: string
    actorUsername?: string
    success: boolean
    error?: string
  }): AuditLog {
    return this.record({
      action: AuditAction.Restore,
      module: 'settings',
      resourceType: 'Database',
      actorUserId: params.actorUserId,
      actorUsername: params.actorUsername,
      summary: params.success
        ? `Database restored from ${params.filename}`
        : `Restore failed from ${params.filename}: ${params.error ?? 'Unknown error'}`,
      outcome: params.success ? AuditOutcome.Success : AuditOutcome.Failure,
    })
  }

  // ── Query methods ────────────────────────────────────────────────

  findByUserId(userId: string, options?: FindOptions): AuditLog[] {
    return this.repository.findByUserId(userId, options)
  }

  findByDateRange(from: Date, to: Date, options?: FindOptions): AuditLog[] {
    return this.repository.findByDateRange(from, to, options)
  }

  findRecent(limit = 50, options?: FindOptions): AuditLog[] {
    return this.repository.findRecent(limit, options)
  }

  findByResourceAndId(resourceType: string, resourceId: string, options?: FindOptions): AuditLog[] {
    return this.repository.findByResourceAndId(resourceType, resourceId, options)
  }

  countFailures(): number {
    return this.repository.countFailures()
  }

  countFailedLogins(username: string, since: Date): number {
    return this.repository.countFailedLogins(username, since)
  }
}
