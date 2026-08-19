import { useCallback, useEffect, useState } from 'react'
import type { ReportDataPoint, ReportModule } from '../types/report.types'

interface ReportProvider {
  getReportData(reportId: string): ReportDataPoint[]
}

let providerPromise: Promise<ReportProvider> | null = null

function getProvider(): Promise<ReportProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('../services/ReportService')
      const svc = mod.reportService
      return {
        getReportData: (reportId: string) => {
          const map: Record<string, () => ReportDataPoint[]> = {
            'hr-employee-summary': () => svc.getHrEmployeeSummary(),
            'hr-attendance-summary': () => svc.getHrAttendanceSummary(),
            'hr-leave-summary': () => svc.getHrLeaveSummary(),
            'hr-payroll-summary': () => svc.getHrPayrollSummary(),
            'inventory-stock-summary': () => svc.getInventoryStockSummary(),
            'inventory-movements-summary': () => svc.getInventoryMovementsSummary(),
            'inventory-valuation': () => svc.getInventoryValuation(),
            'procurement-orders-summary': () => svc.getProcurementOrdersSummary(),
            'procurement-by-supplier': () => svc.getProcurementBySupplier(),
            'sales-summary': () => svc.getSalesSummary(),
            'sales-revenue': () => svc.getSalesRevenue(),
            'assets-summary': () => svc.getAssetsSummary(),
            'assets-by-category': () => svc.getAssetsByCategory(),
            'projects-summary': () => svc.getProjectsSummary(),
            'projects-tasks-summary': () => svc.getProjectsTasksSummary(),
            'accounting-journal-summary': () => svc.getAccountingJournalSummary(),
          }
          const fetcher = map[reportId]
          if (!fetcher) return []
          return fetcher()
        },
      }
    } catch {
      return {
        getReportData: () => [],
      }
    }
  })()
  return providerPromise
}

interface UseReportResult {
  data: ReportDataPoint[]
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useReport(reportId: string): UseReportResult {
  const [data, setData] = useState<ReportDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    getProvider()
      .then((p) => {
        if (active) {
          const result = p.getReportData(reportId)
          setData(result)
          setError(null)
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Failed to load report data')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [reportId, refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  return { data, loading, error, refresh }
}

export function useModuleReports(module: ReportModule): string[] {
  const moduleReportMap: Record<ReportModule, string[]> = {
    hr: ['hr-employee-summary', 'hr-attendance-summary', 'hr-leave-summary', 'hr-payroll-summary'],
    finance: ['accounting-journal-summary'],
    inventory: ['inventory-stock-summary', 'inventory-movements-summary', 'inventory-valuation'],
    procurement: ['procurement-orders-summary', 'procurement-by-supplier'],
    sales: ['sales-summary', 'sales-revenue'],
    assets: ['assets-summary', 'assets-by-category'],
    projects: ['projects-summary', 'projects-tasks-summary'],
    accounting: ['accounting-journal-summary'],
  }
  return moduleReportMap[module] ?? []
}
