/**
 * useImport — React hook for data import operations.
 *
 * Provides file parsing, preview, validation, and transactional import.
 * Supports CSV, Excel, and JSON file types.
 */

import { useCallback, useState } from 'react'

import { pushToast } from '@/stores/notification.store'
import type {
  ImportFileType,
  ImportPreview,
  ImportOptions,
  ImportResult,
  ImportProgress,
  ImportValidationIssue,
} from '@/types/data-management'

interface ImportProvider {
  preview(file: File, fileType: ImportFileType, targetSchema: string): Promise<ImportPreview>
  execute(file: File, options: ImportOptions): Promise<ImportResult>
  setProgressCallback(callback: ((progress: ImportProgress) => void) | null): void
}

let providerPromise: Promise<ImportProvider> | null = null

function getProvider(): Promise<ImportProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/data-management/services/DataManagementService')
      const svc = mod.dataManagementService
      return {
        preview: (file, fileType, targetSchema) => svc.previewImport(file, fileType, targetSchema),
        execute: (file, options) => svc.executeImport(file, options),
        setProgressCallback: (cb) => svc.setImportProgressCallback(cb),
      }
    } catch {
      return getBrowserProvider()
    }
  })()
  return providerPromise
}

function getBrowserProvider(): ImportProvider {
  return {
    preview: async () => ({ headers: [], rows: [], totalRows: 0, detectedMappings: [] }),
    execute: async () => ({ success: false, recordsImported: 0, recordsSkipped: 0, validationIssues: [], error: 'Import not available in browser mode' }),
    setProgressCallback: () => { /* noop */ },
  }
}

export interface UseImportResult {
  importing: boolean
  progress: ImportProgress | null
  preview: ImportPreview | null
  validationIssues: ImportValidationIssue[]
  error: string | null
  parseFile: (file: File, fileType: ImportFileType, targetSchema: string) => Promise<ImportPreview>
  executeImport: (file: File, options: ImportOptions) => Promise<ImportResult>
  clearPreview: () => void
}

export function useImport(): UseImportResult {
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState<ImportProgress | null>(null)
  const [previewData, setPreviewData] = useState<ImportPreview | null>(null)
  const [validationIssues, setValidationIssues] = useState<ImportValidationIssue[]>([])
  const [error, setError] = useState<string | null>(null)

  const parseFile = useCallback(async (file: File, fileType: ImportFileType, targetSchema: string) => {
    setError(null)
    try {
      const p = await getProvider()
      p.setProgressCallback(setProgress)
      const result = await p.preview(file, fileType, targetSchema)
      setPreviewData(result)
      return result
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to parse file'
      setError(msg)
      pushToast({ tone: 'danger', title: msg })
      throw err
    }
  }, [])

  const executeImport = useCallback(async (file: File, options: ImportOptions) => {
    setImporting(true)
    setError(null)
    setValidationIssues([])
    try {
      const p = await getProvider()
      p.setProgressCallback(setProgress)
      const result = await p.execute(file, options)

      if (result.success) {
        pushToast({
          tone: 'success',
          title: `Import complete: ${result.recordsImported} records imported, ${result.recordsSkipped} skipped`,
        })
      } else {
        setValidationIssues(result.validationIssues)
        pushToast({ tone: 'danger', title: result.error ?? 'Import failed' })
      }

      return result
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Import failed'
      setError(msg)
      pushToast({ tone: 'danger', title: msg })
      return { success: false, recordsImported: 0, recordsSkipped: 0, validationIssues: [], error: msg }
    } finally {
      setImporting(false)
      setProgress(null)
    }
  }, [])

  const clearPreview = useCallback(() => {
    setPreviewData(null)
    setValidationIssues([])
    setError(null)
  }, [])

  return {
    importing,
    progress,
    preview: previewData,
    validationIssues,
    error,
    parseFile,
    executeImport,
    clearPreview,
  }
}
