import { useCallback, useEffect, useState } from 'react'
import { savedReportsService } from '../services/SavedReportsService'
import type { SavedReport, SavedReportInput, ReportModule } from '../types/report.types'

interface UseSavedReportsResult {
  items: SavedReport[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: SavedReportInput) => SavedReport | null
  remove: (id: string) => boolean
}

export function useSavedReports(module?: ReportModule): UseSavedReportsResult {
  const [items, setItems] = useState<SavedReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    try {
      const result = module
        ? savedReportsService.findByModule(module)
        : savedReportsService.findAll()
      if (active) {
        setItems(result)
        setError(null)
      }
    } catch (err) {
      if (active) setError(err instanceof Error ? err.message : 'Failed to load saved reports')
    } finally {
      if (active) setLoading(false)
    }
    return () => { active = false }
  }, [module, refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  const create = useCallback((input: SavedReportInput): SavedReport | null => {
    try {
      const result = savedReportsService.create(input)
      refresh()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save report')
      return null
    }
  }, [refresh])

  const remove = useCallback((id: string): boolean => {
    try {
      const result = savedReportsService.delete(id)
      refresh()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete saved report')
      return false
    }
  }, [refresh])

  return { items, loading, error, refresh, create, remove }
}
