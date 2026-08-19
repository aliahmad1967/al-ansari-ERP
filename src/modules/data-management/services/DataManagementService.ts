/**
 * DataManagementService — high-level orchestrator for all data operations.
 *
 * Coordinates backup, restore, import, and export operations.
 * Provides a single entry point for the UI layer.
 */

import { BackupService } from './BackupService'
import { ImportService, type ImportProgressCallback } from './ImportService'
import { ExportService, type ExportProgressCallback } from './ExportService'
import { databaseManager } from '../database/database-manager'
import type {
  BackupInfo,
  BackupCreateOptions,
  BackupValidationResult,
  RestoreOptions,
  RestoreResult,
  ScheduledBackupConfig,
  ScheduledBackupStatus,
  ImportFileType,
  ImportPreview,
  ImportOptions,
  ImportResult,
  ExportFileType,
  ExportColumn,
  ExportResult,
  DataManagementStatus,
} from '@/types/data-management'

export class DataManagementService {
  readonly backup = new BackupService()
  readonly import = new ImportService()
  readonly export = new ExportService()

  // ── Status ────────────────────────────────────────────────────────

  async getStatus(): Promise<DataManagementStatus> {
    if (!databaseManager.isOpen) {
      await databaseManager.open()
    }

    const status = databaseManager.status()
    const backups = this.backup.listBackups()

    return {
      databaseOpen: status.isOpen,
      databaseSizeBytes: status.sizeBytes,
      schemaVersion: status.schemaVersion,
      backupCount: backups.length,
      lastBackupAt: backups.length > 0 ? backups[0].createdAt : null,
      lastExportAt: null,
      lastImportAt: null,
    }
  }

  // ── Backup Convenience ────────────────────────────────────────────

  async createBackup(options: BackupCreateOptions = {}): Promise<BackupInfo> {
    return this.backup.createBackup(options)
  }

  listBackups(): BackupInfo[] {
    return this.backup.listBackups()
  }

  validateBackup(backupPath: string): BackupValidationResult {
    return this.backup.validateBackup(backupPath)
  }

  async restoreFromBackup(options: RestoreOptions): Promise<RestoreResult> {
    return this.backup.restoreFromBackup(options)
  }

  deleteBackup(backupId: string): boolean {
    return this.backup.deleteBackup(backupId)
  }

  // ── Scheduled Backup ──────────────────────────────────────────────

  getScheduledConfig(): ScheduledBackupConfig {
    return this.backup.getScheduledConfig()
  }

  saveScheduledConfig(config: ScheduledBackupConfig): void {
    this.backup.saveScheduledConfig(config)
  }

  getScheduledStatus(): ScheduledBackupStatus {
    return this.backup.getScheduledStatus()
  }

  startScheduledBackup(): void {
    this.backup.startScheduledBackup()
  }

  stopScheduledBackup(): void {
    this.backup.stopScheduledBackup()
  }

  // ── Import Convenience ────────────────────────────────────────────

  setImportProgressCallback(callback: ImportProgressCallback | null): void {
    this.import.setProgressCallback(callback)
  }

  async previewImport(file: File | Buffer, fileType: ImportFileType, targetSchema: string): Promise<ImportPreview> {
    return this.import.previewImport(file, fileType, targetSchema)
  }

  async executeImport(file: File | Buffer, options: ImportOptions): Promise<ImportResult> {
    return this.import.executeImport(file, options)
  }

  // ── Export Convenience ────────────────────────────────────────────

  setExportProgressCallback(callback: ExportProgressCallback | null): void {
    this.export.setProgressCallback(callback)
  }

  async exportData(options: {
    fileType: ExportFileType
    schemas?: string[]
    columns?: ExportColumn[]
    filename?: string
    title?: string
  }): Promise<ExportResult> {
    return this.export.export(options)
  }

  getAvailableSchemas(): string[] {
    return this.export.getAvailableSchemas()
  }

  getSchemaRecordCount(schemaName: string): number {
    return this.export.getSchemaRecordCount(schemaName)
  }
}

/** Shared singleton instance. */
export const dataManagementService = new DataManagementService()
