/**
 * ExportService — export data to CSV, Excel, JSON, and PDF.
 *
 * Responsibilities:
 *  - Export full database or specific schemas
 *  - Export to CSV, Excel (xlsx), JSON, and PDF
 *  - Support progress callbacks for large exports
 *  - Lazy-load heavy dependencies (xlsx, jspdf)
 *  - Audit all export operations
 *  - Support Arabic/English headers
 */

import { saveAs } from 'file-saver'

import { AuditAction, AuditOutcome } from '../models/AuditLog'
import { databaseManager } from '../database/database-manager'
import { AuditRepository } from '../repositories/AuditRepository'
import type {
  ExportColumn,
  ExportOptions,
  ExportProgress,
  ExportResult,
} from '@/types/data-management'

// Lazy-loaded dependencies
let XLSX: typeof import('xlsx') | null = null
let jsPDF: typeof import('jspdf').default | null = null
let autoTable: typeof import('jspdf-autotable').default | null = null

async function getXlsx(): Promise<typeof import('xlsx')> {
  if (!XLSX) XLSX = await import('xlsx')
  return XLSX
}

async function getPdf(): Promise<{ jsPDF: typeof import('jspdf').default; autoTable: typeof import('jspdf-autotable').default }> {
  if (!jsPDF) {
    const pdfModule = await import('jspdf')
    jsPDF = pdfModule.default
  }
  if (!autoTable) {
    const tableModule = await import('jspdf-autotable')
    autoTable = tableModule.default
  }
  return { jsPDF: jsPDF!, autoTable: autoTable! }
}

export type ExportProgressCallback = (progress: ExportProgress) => void

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50)
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export class ExportService {
  private readonly auditRepo = new AuditRepository()
  private progressCallback: ExportProgressCallback | null = null

  setProgressCallback(callback: ExportProgressCallback | null): void {
    this.progressCallback = callback
  }

  // ── Data Collection ───────────────────────────────────────────────

  private collectData(schemas?: string[]): Record<string, { headers: ExportColumn[]; rows: Record<string, unknown>[] }> {
    const realm = databaseManager.getRealm()
    const targetSchemas = schemas ?? realm.schema.map((s) => s.name)
    const result: Record<string, { headers: ExportColumn[]; rows: Record<string, unknown>[] }> = {}

    for (const schemaName of targetSchemas) {
      const schema = realm.schema.find((s) => s.name === schemaName)
      if (!schema) continue

      const records = realm.objects(schemaName)
      const fieldNames = Object.keys(schema.properties).filter(
        (k) => k !== 'isDeleted' && k !== 'deletedAt' && k !== 'schema',
      )

      const headers: ExportColumn[] = fieldNames.map((f) => ({ key: f, header: f }))
      const rows = Array.from(records).map((record) => {
        const json = record.toJSON() as Record<string, unknown>
        const filtered: Record<string, unknown> = {}
        for (const key of fieldNames) {
          filtered[key] = json[key]
        }
        return filtered
      })

      result[schemaName] = { headers, rows }
    }

    return result
  }

  // ── CSV Export ────────────────────────────────────────────────────

  private async exportCsv(data: Record<string, { headers: ExportColumn[]; rows: Record<string, unknown>[] }>, filename: string): Promise<ExportResult> {
    this.reportProgress({ phase: 'exporting', progress: 0, total: 100, currentStep: 'Generating CSV...' })

    const parts: string[] = []
    let totalRecords = 0

    for (const [schemaName, schemaData] of Object.entries(data)) {
      const headers = schemaData.headers.map((h) => h.header)
      const rows = schemaData.rows.map((row) =>
        schemaData.headers.map((col) => {
          const val = row[col.key]
          if (val === null || val === undefined) return ''
          if (val instanceof Date) return val.toISOString()
          return String(val)
        }),
      )

      parts.push(`--- ${schemaName} ---`)
      parts.push(headers.join(','))
      for (const row of rows) {
        parts.push(
          row
            .map((cell) => {
              if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
                return `"${cell.replace(/"/g, '""')}"`
              }
              return cell
            })
            .join(','),
        )
      }
      parts.push('')
      totalRecords += rows.length
    }

    const csvContent = parts.join('\n')
    const bom = '\uFEFF'
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })
    const fullFilename = `${sanitizeFilename(filename)}_${formatDate(new Date())}.csv`
    saveAs(blob, fullFilename)

    this.auditRepo.create({
      action: AuditAction.Export,
      module: 'settings',
      resourceType: 'Database',
      summary: `Exported ${totalRecords} records to CSV`,
      outcome: AuditOutcome.Success,
    })

    this.reportProgress({ phase: 'complete', progress: 100, total: 100, currentStep: 'CSV export complete' })

    return { success: true, filename: fullFilename, sizeBytes: blob.size, recordCount: totalRecords }
  }

  // ── Excel Export ──────────────────────────────────────────────────

  private async exportExcel(data: Record<string, { headers: ExportColumn[]; rows: Record<string, unknown>[] }>, filename: string): Promise<ExportResult> {
    this.reportProgress({ phase: 'exporting', progress: 0, total: 100, currentStep: 'Generating Excel...' })

    const xlsx = await getXlsx()
    const wb = xlsx.utils.book_new()
    let totalRecords = 0

    for (const [schemaName, schemaData] of Object.entries(data)) {
      const headers = schemaData.headers.map((h) => h.header)
      const rows = schemaData.rows.map((row) =>
        schemaData.headers.map((col) => {
          const val = row[col.key]
          if (val === null || val === undefined) return ''
          if (val instanceof Date) return val.toISOString()
          return val
        }),
      )

      const wsData = [headers, ...rows]
      const ws = xlsx.utils.aoa_to_sheet(wsData)
      ws['!cols'] = schemaData.headers.map((h) => ({ wch: h.width ?? 18 }))
      xlsx.utils.book_append_sheet(wb, ws, schemaName.slice(0, 31))
      totalRecords += rows.length
    }

    const excelBuffer = xlsx.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    const fullFilename = `${sanitizeFilename(filename)}_${formatDate(new Date())}.xlsx`
    saveAs(blob, fullFilename)

    this.auditRepo.create({
      action: AuditAction.Export,
      module: 'settings',
      resourceType: 'Database',
      summary: `Exported ${totalRecords} records to Excel`,
      outcome: AuditOutcome.Success,
    })

    this.reportProgress({ phase: 'complete', progress: 100, total: 100, currentStep: 'Excel export complete' })

    return { success: true, filename: fullFilename, sizeBytes: blob.size, recordCount: totalRecords }
  }

  // ── JSON Export ───────────────────────────────────────────────────

  private async exportJson(filename: string, schemas?: string[]): Promise<ExportResult> {
    this.reportProgress({ phase: 'exporting', progress: 0, total: 100, currentStep: 'Generating JSON...' })

    const realm = databaseManager.getRealm()
    const targetSchemas = schemas ?? realm.schema.map((s) => s.name)
    const dump: Record<string, unknown[]> = {}
    let totalRecords = 0

    for (const schemaName of targetSchemas) {
      const records = realm.objects(schemaName)
      dump[schemaName] = Array.from(records).map((r) => r.toJSON())
      totalRecords += records.length
    }

    const jsonStr = JSON.stringify(
      { exportedAt: new Date().toISOString(), schemaVersion: realm.schemaVersion, data: dump },
      null,
      2,
    )

    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' })
    const fullFilename = `${sanitizeFilename(filename)}_${formatDate(new Date())}.json`
    saveAs(blob, fullFilename)

    this.auditRepo.create({
      action: AuditAction.Export,
      module: 'settings',
      resourceType: 'Database',
      summary: `Exported ${totalRecords} records to JSON`,
      outcome: AuditOutcome.Success,
    })

    this.reportProgress({ phase: 'complete', progress: 100, total: 100, currentStep: 'JSON export complete' })

    return { success: true, filename: fullFilename, sizeBytes: blob.size, recordCount: totalRecords }
  }

  // ── PDF Export ────────────────────────────────────────────────────

  private async exportPdf(data: Record<string, { headers: ExportColumn[]; rows: Record<string, unknown>[] }>, filename: string, title?: string): Promise<ExportResult> {
    this.reportProgress({ phase: 'exporting', progress: 0, total: 100, currentStep: 'Generating PDF...' })

    const { jsPDF: JsPDF, autoTable: autoTableFn } = await getPdf()
    const doc = new JsPDF({ orientation: 'portrait' })
    let yPos = 14
    let totalRecords = 0

    if (title) {
      doc.setFontSize(16)
      doc.text(title, 14, yPos)
      yPos += 8
      doc.setFontSize(10)
      doc.text(`Generated: ${formatDate(new Date())}`, 14, yPos)
      yPos += 10
    }

    for (const [schemaName, schemaData] of Object.entries(data)) {
      if (yPos > 260) {
        doc.addPage()
        yPos = 14
      }

      doc.setFontSize(12)
      doc.text(schemaName, 14, yPos)
      yPos += 6

      const headers = schemaData.headers.map((h) => h.header)
      const rows = schemaData.rows.map((row) =>
        schemaData.headers.map((col) => {
          const val = row[col.key]
          if (val === null || val === undefined) return ''
          if (val instanceof Date) return val.toISOString().slice(0, 10)
          return String(val).slice(0, 50)
        }),
      )

      autoTableFn(doc, {
        head: [headers],
        body: rows,
        startY: yPos,
        styles: { fontSize: 7 },
        headStyles: { fillColor: [59, 130, 246] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      })

      yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
      totalRecords += rows.length
    }

    const pdfBuffer = doc.output('arraybuffer')
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' })
    const fullFilename = `${sanitizeFilename(filename)}_${formatDate(new Date())}.pdf`
    saveAs(blob, fullFilename)

    this.auditRepo.create({
      action: AuditAction.Export,
      module: 'settings',
      resourceType: 'Database',
      summary: `Exported ${totalRecords} records to PDF`,
      outcome: AuditOutcome.Success,
    })

    this.reportProgress({ phase: 'complete', progress: 100, total: 100, currentStep: 'PDF export complete' })

    return { success: true, filename: fullFilename, sizeBytes: blob.size, recordCount: totalRecords }
  }

  // ── Main Export Method ────────────────────────────────────────────

  async export(options: ExportOptions): Promise<ExportResult> {
    if (!databaseManager.isOpen) {
      await databaseManager.open()
    }

    this.reportProgress({ phase: 'preparing', progress: 0, total: 100, currentStep: 'Preparing export...' })

    const filename = options.filename ?? 'al-ansari-export'

    try {
      switch (options.fileType) {
        case 'json':
          return await this.exportJson(filename, options.schemas)
        case 'csv':
        case 'excel':
        case 'pdf': {
          const data = this.collectData(options.schemas)
          switch (options.fileType) {
            case 'csv':
              return await this.exportCsv(data, filename)
            case 'excel':
              return await this.exportExcel(data, filename)
            case 'pdf':
              return await this.exportPdf(data, filename, options.title)
          }
        }
      }
    } catch (error) {
      this.auditRepo.create({
        action: AuditAction.Export,
        module: 'settings',
        resourceType: 'Database',
        summary: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        outcome: AuditOutcome.Failure,
      })

      this.reportProgress({ phase: 'error', progress: 0, total: 100, currentStep: 'Export failed' })

      return {
        success: false,
        filename: '',
        sizeBytes: 0,
        recordCount: 0,
        error: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  // ── Available Schemas ─────────────────────────────────────────────

  getAvailableSchemas(): string[] {
    try {
      const realm = databaseManager.getRealm()
      return realm.schema.map((s) => s.name).sort()
    } catch {
      return []
    }
  }

  getSchemaRecordCount(schemaName: string): number {
    try {
      const realm = databaseManager.getRealm()
      return realm.objects(schemaName).length
    } catch {
      return 0
    }
  }

  private reportProgress(progress: ExportProgress): void {
    this.progressCallback?.(progress)
  }
}
