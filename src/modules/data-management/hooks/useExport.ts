/**
 * useExport — React hook for data export operations.
 *
 * Provides export to CSV, Excel, JSON, and PDF with progress tracking.
 */

import { useCallback, useEffect, useState } from 'react'

import { pushToast } from '@/stores/notification.store'
import type {
  ExportFileType,
  ExportColumn,
  ExportProgress,
  ExportResult,
} from '@/types/data-management'

interface ExportProvider {
  exportData(options: {
    fileType: ExportFileType
    schemas?: string[]
    columns?: ExportColumn[]
    filename?: string
    title?: string
  }): Promise<ExportResult>
  getAvailableSchemas(): string[]
  getSchemaRecordCount(schemaName: string): number
  setProgressCallback(callback: ((progress: ExportProgress) => void) | null): void
}

let providerPromise: Promise<ExportProvider> | null = null

function getProvider(): Promise<ExportProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/data-management/services/DataManagementService')
      const svc = mod.dataManagementService
      return {
        exportData: (options) => svc.exportData(options),
        getAvailableSchemas: () => svc.getAvailableSchemas(),
        getSchemaRecordCount: (name) => svc.getSchemaRecordCount(name),
        setProgressCallback: (cb) => svc.setExportProgressCallback(cb),
      }
    } catch {
      return getBrowserProvider()
    }
  })()
  return providerPromise
}

function getBrowserProvider(): ExportProvider {
  return {
    exportData: async () => ({ success: false, filename: '', sizeBytes: 0, recordCount: 0, error: 'Export not available in browser mode' }),
    getAvailableSchemas: () => [],
    getSchemaRecordCount: () => 0,
    setProgressCallback: () => { /* noop */ },
  }
}

export interface UseExportResult {
  exporting: boolean
  progress: ExportProgress | null
  availableSchemas: string[]
  error: string | null
  exportData: (options: {
    fileType: ExportFileType
    schemas?: string[]
    columns?: ExportColumn[]
    filename?: string
    title?: string
  }) => Promise<ExportResult | null>
  getSchemaRecordCount: (schemaName: string) => number
  refreshSchemas: () => void
}

export function useExport(): UseExportResult {
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState<ExportProgress | null>(null)
  const [availableSchemas, setAvailableSchemas] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => {
        if (active) {
          setAvailableSchemas(p.getAvailableSchemas())
          setError(null)
        }
      })
      .catch(() => { /* noop */ })
    return () => { active = false }
  }, [refreshKey])

  const exportData = useCallback(async (options: {
    fileType: ExportFileType
    schemas?: string[]
    columns?: ExportColumn[]
    filename?: string
    title?: string
  }) => {
    setExporting(true)
    setError(null)
    try {
      const p = await getProvider()
      p.setProgressCallback(setProgress)
      const result = await p.exportData(options)

      if (result.success) {
        pushToast({
          tone: 'success',
          title: `Export complete: ${result.recordCount} records to ${result.filename}`,
        })
      } else {
        pushToast({ tone: 'danger', title: result.error ?? 'Export failed' })
      }

      return result
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Export failed'
      setError(msg)
      pushToast({ tone: 'danger', title: msg })
      return null
    } finally {
      setExporting(false)
      setProgress(null)
    }
  }, [])

  const getSchemaRecordCount = useCallback(async (schemaName: string) => {
    const p = await getProvider()
    return p.getSchemaRecordCount(schemaName)
  }, [])

  const refreshSchemas = useCallback(() => setRefreshKey((k) => k + 1), [])

  return {
    exporting,
    progress,
    availableSchemas,
    error,
    exportData,
    getSchemaRecordCount,
    refreshSchemas,
  }
}
