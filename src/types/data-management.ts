/**
 * Data management types — shared interfaces for backup, restore, import, and export.
 */

// ── Backup ───────────────────────────────────────────────────────────

export interface BackupInfo {
  id: string
  filename: string
  path: string
  sizeBytes: number
  createdAt: Date
  isEncrypted: boolean
  schemaVersion: number | null
  description?: string
}

export interface BackupCreateOptions {
  targetPath?: string
  description?: string
  encrypted?: boolean
  encryptionKey?: Uint8Array
}

export interface BackupValidationResult {
  valid: boolean
  schemaVersion: number | null
  sizeBytes: number
  recordCounts: Record<string, number>
  errors: string[]
}

// ── Restore ──────────────────────────────────────────────────────────

export interface RestoreOptions {
  sourcePath: string
  createBackupBeforeRestore?: boolean
  confirmationToken?: string
  encryptionKey?: Uint8Array
}

export interface RestoreResult {
  success: boolean
  backupPath?: string
  error?: string
}

// ── Scheduled Backup ─────────────────────────────────────────────────

export type ScheduledFrequency = 'daily' | 'weekly' | 'monthly'

export interface ScheduledBackupConfig {
  enabled: boolean
  frequency: ScheduledFrequency
  timeOfDay: string
  maxBackups: number
  encrypted: boolean
}

export interface ScheduledBackupStatus {
  nextRunAt: Date | null
  lastRunAt: Date | null
  lastResult: 'success' | 'failure' | null
  totalRuns: number
}

// ── Import ───────────────────────────────────────────────────────────

export type ImportFileType = 'csv' | 'excel' | 'json'

export interface ImportColumnMapping {
  sourceColumn: string
  targetField: string
}

export interface ImportValidationIssue {
  row: number
  field: string
  message: string
  severity: 'error' | 'warning'
}

export interface ImportPreview {
  headers: string[]
  rows: unknown[][]
  totalRows: number
  detectedMappings: ImportColumnMapping[]
}

export interface ImportOptions {
  fileType: ImportFileType
  targetSchema: string
  mappings?: ImportColumnMapping[]
  skipValidation?: boolean
  dryRun?: boolean
}

export interface ImportResult {
  success: boolean
  recordsImported: number
  recordsSkipped: number
  validationIssues: ImportValidationIssue[]
  error?: string
}

export interface ImportProgress {
  phase: 'parsing' | 'validating' | 'importing' | 'complete' | 'error'
  progress: number
  total: number
  currentStep: string
}

// ── Export ───────────────────────────────────────────────────────────

export type ExportFileType = 'csv' | 'excel' | 'json' | 'pdf'

export interface ExportColumn {
  key: string
  header: string
  headerAr?: string
  width?: number
}

export interface ExportOptions {
  fileType: ExportFileType
  schemas?: string[]
  columns?: ExportColumn[]
  filename?: string
  title?: string
  includeHeaders?: boolean
}

export interface ExportProgress {
  phase: 'preparing' | 'exporting' | 'complete' | 'error'
  progress: number
  total: number
  currentStep: string
}

export interface ExportResult {
  success: boolean
  filename: string
  sizeBytes: number
  recordCount: number
  error?: string
}

// ── Data Management Status ───────────────────────────────────────────

export interface DataManagementStatus {
  databaseOpen: boolean
  databaseSizeBytes: number
  schemaVersion: number | null
  backupCount: number
  lastBackupAt: Date | null
  lastExportAt: Date | null
  lastImportAt: Date | null
}
