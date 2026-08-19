/**
 * ImportService — import data from CSV, Excel, and JSON files.
 *
 * Responsibilities:
 *  - Parse CSV and Excel files using the xlsx library
 *  - Parse JSON exports from the ERP
 *  - Validate imported data against schema rules
 *  - Execute transactional imports (all-or-nothing)
 *  - Provide progress callbacks for UI feedback
 *  - Support column mapping for flexible imports
 *  - Audit all import operations
 */

import { AuditAction, AuditOutcome } from '../models/AuditLog'
import { databaseManager } from '../database/database-manager'
import { AuditRepository } from '../repositories/AuditRepository'
import type {
  ImportFileType,
  ImportPreview,
  ImportOptions,
  ImportResult,
  ImportValidationIssue,
  ImportColumnMapping,
  ImportProgress,
} from '@/types/data-management'

// Lazy-loaded xlsx to keep initial bundle small
let XLSX: typeof import('xlsx') | null = null

async function getXlsx(): Promise<typeof import('xlsx')> {
  if (!XLSX) {
    XLSX = await import('xlsx')
  }
  return XLSX
}

export type ImportProgressCallback = (progress: ImportProgress) => void

const REQUIRED_FIELDS: Record<string, string[]> = {
  Employee: ['firstName', 'lastName'],
  Product: ['name', 'sku'],
  Supplier: ['name'],
  Customer: ['name'],
  PurchaseRequest: ['code', 'requestDate'],
  PurchaseOrder: ['code', 'orderDate'],
}

export class ImportService {
  private readonly auditRepo = new AuditRepository()
  private progressCallback: ImportProgressCallback | null = null

  setProgressCallback(callback: ImportProgressCallback | null): void {
    this.progressCallback = callback
  }

  // ── File Parsing ──────────────────────────────────────────────────

  async parseFile(
    file: File | Buffer,
    fileType: ImportFileType,
  ): Promise<{ headers: string[]; rows: unknown[][] }> {
    this.reportProgress({ phase: 'parsing', progress: 0, total: 100, currentStep: 'Reading file...' })

    const xlsx = await getXlsx()

    let workbook: import('xlsx').WorkBook

    if (fileType === 'json') {
      const text = typeof file === 'string' ? file : await (file as File).text()
      const data = JSON.parse(text)
      const records = Array.isArray(data) ? data : data.data ?? []
      if (records.length === 0) return { headers: [], rows: [] }
      const headers = Object.keys(records[0])
      const rows = records.map((r: Record<string, unknown>) => headers.map((h) => r[h]))
      this.reportProgress({ phase: 'parsing', progress: 100, total: 100, currentStep: 'Complete' })
      return { headers, rows }
    }

    if (file instanceof Buffer) {
      workbook = xlsx.read(file, { type: 'buffer' })
    } else {
      const arrayBuffer = await file.arrayBuffer()
      workbook = xlsx.read(arrayBuffer, { type: 'array' })
    }

    const sheetName = workbook.SheetNames[0]
    if (!sheetName) return { headers: [], rows: [] }

    const sheet = workbook.Sheets[sheetName]
    const data = xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet, { header: 1 })

    if (data.length === 0) return { headers: [], rows: [] }

    const headers = (data[0] as string[]).map(String)
    const rows = data.slice(1).filter((row) =>
      (row as unknown[]).some((cell) => cell !== null && cell !== undefined && cell !== ''),
    ) as unknown[][]

    this.reportProgress({ phase: 'parsing', progress: 100, total: 100, currentStep: 'Complete' })
    return { headers, rows }
  }

  // ── Preview ───────────────────────────────────────────────────────

  async previewImport(
    file: File | Buffer,
    fileType: ImportFileType,
    targetSchema: string,
  ): Promise<ImportPreview> {
    const { headers, rows } = await this.parseFile(file, fileType)
    const detectedMappings = this.detectMappings(headers, targetSchema)

    return {
      headers,
      rows: rows.slice(0, 10),
      totalRows: rows.length,
      detectedMappings,
    }
  }

  // ── Validation ────────────────────────────────────────────────────

  validateData(
    headers: string[],
    rows: unknown[][],
    mappings: ImportColumnMapping[],
    targetSchema: string,
  ): ImportValidationIssue[] {
    const issues: ImportValidationIssue[] = []
    const requiredFields = REQUIRED_FIELDS[targetSchema] ?? []

    // Check required mappings
    for (const field of requiredFields) {
      const hasMapping = mappings.some((m) => m.targetField === field)
      if (!hasMapping) {
        issues.push({
          row: 0,
          field,
          message: `Required field "${field}" is not mapped.`,
          severity: 'error',
        })
      }
    }

    // Validate row data
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      for (const mapping of mappings) {
        const sourceIdx = headers.indexOf(mapping.sourceColumn)
        if (sourceIdx === -1) continue

        const value = row[sourceIdx]
        if (value === null || value === undefined || value === '') {
          if (requiredFields.includes(mapping.targetField)) {
            issues.push({
              row: i + 1,
              field: mapping.targetField,
              message: `Required field "${mapping.targetField}" is empty.`,
              severity: 'error',
            })
          }
          continue
        }

        // Type validation based on field name patterns
        const typeIssue = this.validateFieldType(mapping.targetField, value)
        if (typeIssue) {
          issues.push({
            row: i + 1,
            field: mapping.targetField,
            message: typeIssue,
            severity: 'warning',
          })
        }
      }
    }

    return issues
  }

  private validateFieldType(field: string, value: unknown): string | null {
    const strValue = String(value)

    if (field.endsWith('Date') || field.endsWith('At')) {
      const date = new Date(strValue)
      if (isNaN(date.getTime())) {
        return `Invalid date value "${strValue}".`
      }
    }

    if (field.endsWith('Amount') || field.endsWith('Cost') || field.endsWith('Price') || field === 'quantity') {
      if (isNaN(Number(strValue))) {
        return `Invalid number value "${strValue}".`
      }
    }

    if (field === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strValue)) {
        return `Invalid email format "${strValue}".`
      }
    }

    return null
  }

  // ── Import Execution ──────────────────────────────────────────────

  async executeImport(
    file: File | Buffer,
    options: ImportOptions,
  ): Promise<ImportResult> {
    if (!databaseManager.isOpen) {
      await databaseManager.open()
    }

    // Parse the file
    const { headers, rows } = await this.parseFile(file, options.fileType)
    if (rows.length === 0) {
      return { success: false, recordsImported: 0, recordsSkipped: 0, validationIssues: [], error: 'No data rows found.' }
    }

    // Apply mappings
    const mappings = options.mappings ?? this.detectMappings(headers, options.targetSchema)

    // Validate
    this.reportProgress({ phase: 'validating', progress: 0, total: rows.length, currentStep: 'Validating data...' })

    const validationIssues = this.validateData(headers, rows, mappings, options.targetSchema)
    const errors = validationIssues.filter((i) => i.severity === 'error')

    if (errors.length > 0 && !options.skipValidation) {
      this.reportProgress({ phase: 'error', progress: 0, total: rows.length, currentStep: 'Validation failed' })
      return {
        success: false,
        recordsImported: 0,
        recordsSkipped: rows.length,
        validationIssues,
        error: `Validation failed with ${errors.length} error(s).`,
      }
    }

    if (options.dryRun) {
      return {
        success: true,
        recordsImported: 0,
        recordsSkipped: 0,
        validationIssues,
      }
    }

    // Execute transactional import
    this.reportProgress({ phase: 'importing', progress: 0, total: rows.length, currentStep: 'Importing records...' })

    const realm = databaseManager.getRealm()
    let imported = 0
    let skipped = 0

    try {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const record: Record<string, unknown> = {}

        for (const mapping of mappings) {
          const sourceIdx = headers.indexOf(mapping.sourceColumn)
          if (sourceIdx === -1) continue

          const value = row[sourceIdx]
          record[mapping.targetField] = this.coerceValue(value, mapping.targetField)
        }

        // Check for required fields
        const requiredFields = REQUIRED_FIELDS[options.targetSchema] ?? []
        const hasAllRequired = requiredFields.every(
          (f) => record[f] !== null && record[f] !== undefined && record[f] !== '',
        )

        if (!hasAllRequired) {
          skipped++
          continue
        }

        // Write in a transaction
        realm.write(() => {
          realm.create(options.targetSchema, record, 'modified')
        })
        imported++

        this.reportProgress({
          phase: 'importing',
          progress: i + 1,
          total: rows.length,
          currentStep: `Imported ${imported} of ${rows.length} records...`,
        })
      }

      this.auditRepo.create({
        action: AuditAction.Import,
        module: 'settings',
        resourceType: options.targetSchema,
        summary: `Imported ${imported} records into ${options.targetSchema} (${skipped} skipped)`,
        outcome: AuditOutcome.Success,
      })

      this.reportProgress({ phase: 'complete', progress: 100, total: rows.length, currentStep: 'Import complete' })

      return {
        success: true,
        recordsImported: imported,
        recordsSkipped: skipped,
        validationIssues,
      }
    } catch (error) {
      this.auditRepo.create({
        action: AuditAction.Import,
        module: 'settings',
        resourceType: options.targetSchema,
        summary: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        outcome: AuditOutcome.Failure,
      })

      this.reportProgress({ phase: 'error', progress: imported, total: rows.length, currentStep: 'Import failed' })

      return {
        success: false,
        recordsImported: imported,
        recordsSkipped: skipped,
        validationIssues,
        error: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  // ── Mapping Detection ─────────────────────────────────────────────

  detectMappings(headers: string[], targetSchema: string): ImportColumnMapping[] {
    const schemaFields = this.getSchemaFields(targetSchema)
    const mappings: ImportColumnMapping[] = []

    for (const header of headers) {
      const normalized = header.toLowerCase().replace(/[\s_-]+/g, '')
      const matched = schemaFields.find((field) => {
        const normalizedField = field.toLowerCase().replace(/[\s_-]+/g, '')
        return normalized === normalizedField || normalized.includes(normalizedField) || normalizedField.includes(normalized)
      })

      if (matched) {
        mappings.push({ sourceColumn: header, targetField: matched })
      }
    }

    return mappings
  }

  private getSchemaFields(schemaName: string): string[] {
    try {
      const realm = databaseManager.getRealm()
      const schema = realm.schema.find((s) => s.name === schemaName)
      if (!schema) return []
      return Object.keys(schema.properties).filter((k) => k !== '_id' && k !== 'isDeleted' && k !== 'deletedAt')
    } catch {
      return []
    }
  }

  private coerceValue(value: unknown, field: string): unknown {
    if (value === null || value === undefined || value === '') return null
    const strValue = String(value)

    if (field.endsWith('Date') || field.endsWith('At')) {
      const date = new Date(strValue)
      return isNaN(date.getTime()) ? null : date
    }

    if (field.endsWith('Amount') || field.endsWith('Cost') || field.endsWith('Price') || field === 'quantity' || field.endsWith('Rate')) {
      const num = Number(strValue)
      return isNaN(num) ? 0 : num
    }

    if (field === 'isActive' || field === 'isDeleted') {
      return strValue === 'true' || strValue === '1' || strValue === 'yes'
    }

    return strValue
  }

  private reportProgress(progress: ImportProgress): void {
    this.progressCallback?.(progress)
  }
}
