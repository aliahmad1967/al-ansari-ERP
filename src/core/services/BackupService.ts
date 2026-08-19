/**
 * BackupService — comprehensive backup management.
 *
 * Responsibilities:
 *  - Create manual and scheduled backups
 *  - List existing backups with metadata
 *  - Validate backup integrity
 *  - Restore from backup with pre-restore safety backup
 *  - Manage scheduled backup configuration
 *  - Clean up old backups based on retention policy
 *  - Audit all backup/restore operations
 */

import fs from 'node:fs'
import path from 'node:path'

import Realm from 'realm'

import { AuditAction, AuditOutcome } from '../models/AuditLog'
import { databaseManager } from '../database/database-manager'
import { AuditRepository } from '../repositories/AuditRepository'
import type {
  BackupInfo,
  BackupCreateOptions,
  BackupValidationResult,
  RestoreOptions,
  RestoreResult,
  ScheduledBackupConfig,
  ScheduledBackupStatus,
} from '@/types/data-management'

const SCHEDULED_CONFIG_KEY = 'erp_scheduled_backup_config'
const SCHEDULED_STATUS_KEY = 'erp_scheduled_backup_status'

export class BackupService {
  private readonly auditRepo = new AuditRepository()
  private scheduleTimer: ReturnType<typeof setInterval> | null = null

  // ── Manual Backup ─────────────────────────────────────────────────

  async createBackup(options: BackupCreateOptions = {}): Promise<BackupInfo> {
    if (!databaseManager.isOpen) {
      await databaseManager.open()
    }

    const targetPath = options.targetPath ?? databaseManager.backup()
    const stats = fs.statSync(targetPath)
    const filename = path.basename(targetPath)

    const backupInfo: BackupInfo = {
      id: filename,
      filename,
      path: targetPath,
      sizeBytes: stats.size,
      createdAt: new Date(),
      isEncrypted: options.encrypted ?? false,
      schemaVersion: databaseManager.schemaVersion,
      description: options.description,
    }

    this.auditRepo.create({
      action: AuditAction.Backup,
      module: 'settings',
      resourceType: 'Database',
      resourceId: filename,
      summary: `Backup created: ${filename} (${this.formatBytes(stats.size)})`,
      outcome: AuditOutcome.Success,
    })

    return backupInfo
  }

  // ── Backup Listing ────────────────────────────────────────────────

  listBackups(): BackupInfo[] {
    const backupsDir = databaseManager.getBackupsDirectory()
    if (!fs.existsSync(backupsDir)) return []

    const files = fs.readdirSync(backupsDir).filter((f) => f.endsWith('.realm'))
    const backups: BackupInfo[] = []

    for (const file of files) {
      const filePath = path.join(backupsDir, file)
      try {
        const stats = fs.statSync(filePath)
        backups.push({
          id: file,
          filename: file,
          path: filePath,
          sizeBytes: stats.size,
          createdAt: stats.birthtime,
          isEncrypted: false,
          schemaVersion: null,
        })
      } catch {
        // Skip files we can't stat
      }
    }

    return backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  getBackupById(id: string): BackupInfo | null {
    return this.listBackups().find((b) => b.id === id) ?? null
  }

  // ── Backup Validation ─────────────────────────────────────────────

  validateBackup(backupPath: string): BackupValidationResult {
    const result: BackupValidationResult = {
      valid: false,
      schemaVersion: null,
      sizeBytes: 0,
      recordCounts: {},
      errors: [],
    }

    if (!fs.existsSync(backupPath)) {
      result.errors.push(`Backup file not found: ${backupPath}`)
      return result
    }

    const stats = fs.statSync(backupPath)
    result.sizeBytes = stats.size

    if (result.sizeBytes === 0) {
      result.errors.push('Backup file is empty.')
      return result
    }

    // Try to open the backup as a Realm to verify integrity
    try {
      const tempRealm = new Realm({ path: backupPath, readOnly: true })
      result.schemaVersion = tempRealm.schemaVersion

      for (const schema of tempRealm.schema) {
        const count = tempRealm.objects(schema.name).length
        result.recordCounts[schema.name] = count
      }

      tempRealm.close()
      result.valid = true
    } catch (error) {
      result.errors.push(`Failed to read backup: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return result
  }

  // ── Restore ───────────────────────────────────────────────────────

  async restoreFromBackup(options: RestoreOptions): Promise<RestoreResult> {
    // Validate the backup first
    const validation = this.validateBackup(options.sourcePath)
    if (!validation.valid) {
      return {
        success: false,
        error: `Backup validation failed: ${validation.errors.join(', ')}`,
      }
    }

    // Create a safety backup before restoring
    let backupPath: string | undefined
    if (options.createBackupBeforeRestore !== false) {
      try {
        const backup = await this.createBackup({
          description: 'Pre-restore safety backup',
        })
        backupPath = backup.path
      } catch (error) {
        return {
          success: false,
          error: `Failed to create safety backup: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }
      }
    }

    try {
      await databaseManager.restore(options.sourcePath)

      this.auditRepo.create({
        action: AuditAction.Restore,
        module: 'settings',
        resourceType: 'Database',
        resourceId: options.sourcePath,
        summary: `Database restored from ${path.basename(options.sourcePath)}`,
        outcome: AuditOutcome.Success,
      })

      return { success: true, backupPath }
    } catch (error) {
      this.auditRepo.create({
        action: AuditAction.Restore,
        module: 'settings',
        resourceType: 'Database',
        resourceId: options.sourcePath,
        summary: `Restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        outcome: AuditOutcome.Failure,
      })

      return {
        success: false,
        error: `Restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  // ── Backup Deletion ───────────────────────────────────────────────

  deleteBackup(backupId: string): boolean {
    const backup = this.getBackupById(backupId)
    if (!backup) return false

    try {
      fs.unlinkSync(backup.path)
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'settings',
        resourceType: 'Backup',
        resourceId: backupId,
        summary: `Backup deleted: ${backupId}`,
        outcome: AuditOutcome.Success,
      })
      return true
    } catch {
      return false
    }
  }

  // ── Scheduled Backup ──────────────────────────────────────────────

  getScheduledConfig(): ScheduledBackupConfig {
    try {
      const stored = localStorage.getItem(SCHEDULED_CONFIG_KEY)
      if (stored) return JSON.parse(stored)
    } catch {
      // Fall through to default
    }
    return {
      enabled: false,
      frequency: 'daily',
      timeOfDay: '02:00',
      maxBackups: 30,
      encrypted: false,
    }
  }

  saveScheduledConfig(config: ScheduledBackupConfig): void {
    localStorage.setItem(SCHEDULED_CONFIG_KEY, JSON.stringify(config))
  }

  getScheduledStatus(): ScheduledBackupStatus {
    try {
      const stored = localStorage.getItem(SCHEDULED_STATUS_KEY)
      if (stored) return JSON.parse(stored)
    } catch {
      // Fall through to default
    }
    return {
      nextRunAt: null,
      lastRunAt: null,
      lastResult: null,
      totalRuns: 0,
    }
  }

  private saveScheduledStatus(status: ScheduledBackupStatus): void {
    localStorage.setItem(SCHEDULED_STATUS_KEY, JSON.stringify(status))
  }

  startScheduledBackup(): void {
    this.stopScheduledBackup()
    const config = this.getScheduledConfig()
    if (!config.enabled) return

    const intervalMs = this.getIntervalMs(config.frequency)
    this.scheduleTimer = setInterval(() => {
      this.executeScheduledBackup()
    }, intervalMs)

    this.updateNextRunTime()
  }

  stopScheduledBackup(): void {
    if (this.scheduleTimer) {
      clearInterval(this.scheduleTimer)
      this.scheduleTimer = null
    }
  }

  private async executeScheduledBackup(): Promise<void> {
    const status = this.getScheduledStatus()
    try {
      await this.createBackup({ description: 'Scheduled backup' })
      status.lastRunAt = new Date()
      status.lastResult = 'success'
      status.totalRuns += 1
    } catch {
      status.lastRunAt = new Date()
      status.lastResult = 'failure'
      status.totalRuns += 1
    }
    this.saveScheduledStatus(status)
    this.cleanupOldBackups()
    this.updateNextRunTime()
  }

  private cleanupOldBackups(): void {
    const config = this.getScheduledConfig()
    const backups = this.listBackups()
    const scheduledBackups = backups.filter((b) =>
      b.filename.startsWith('backup-') && b.filename.includes('T'),
    )

    if (scheduledBackups.length > config.maxBackups) {
      const toDelete = scheduledBackups.slice(config.maxBackups)
      for (const backup of toDelete) {
        this.deleteBackup(backup.id)
      }
    }
  }

  private updateNextRunTime(): void {
    const config = this.getScheduledConfig()
    const status = this.getScheduledStatus()

    if (!config.enabled) {
      status.nextRunAt = null
      this.saveScheduledStatus(status)
      return
    }

    const now = new Date()
    const [hours, minutes] = config.timeOfDay.split(':').map(Number)
    const nextRun = new Date(now)
    nextRun.setHours(hours, minutes, 0, 0)

    if (nextRun <= now) {
      switch (config.frequency) {
        case 'daily':
          nextRun.setDate(nextRun.getDate() + 1)
          break
        case 'weekly':
          nextRun.setDate(nextRun.getDate() + 7)
          break
        case 'monthly':
          nextRun.setMonth(nextRun.getMonth() + 1)
          break
      }
    }

    status.nextRunAt = nextRun
    this.saveScheduledStatus(status)
  }

  private getIntervalMs(frequency: string): number {
    switch (frequency) {
      case 'daily':
        return 24 * 60 * 60 * 1000
      case 'weekly':
        return 7 * 24 * 60 * 60 * 1000
      case 'monthly':
        return 30 * 24 * 60 * 60 * 1000
      default:
        return 24 * 60 * 60 * 1000
    }
  }

  // ── Utilities ─────────────────────────────────────────────────────

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  getBackupsDirectory(): string {
    return databaseManager.getBackupsDirectory()
  }
}
