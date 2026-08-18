import { useCallback, useEffect, useState } from 'react'

interface DevFiscalYear {
  _id: string
  code: string
  name: string
  nameAr: string | null
  startDate: string
  endDate: string
  status: string
  isClosed: boolean
  closedAt: string | null
  closedByUserId: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  isDeleted: boolean
  deletedAt: string | null
}

interface FiscalYearProvider {
  getAll(): DevFiscalYear[]
  getById(id: string): DevFiscalYear | undefined
  search(query: string): DevFiscalYear[]
}

let providerPromise: Promise<FiscalYearProvider> | null = null

function getProvider(): Promise<FiscalYearProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/accounting/services/FiscalYearService')
      const svc = new mod.FiscalYearService()
      return {
        getAll: () => svc.findAllYears().map((r: unknown) => r as unknown as DevFiscalYear),
        getById: (id) => svc.findYearById(id) as unknown as DevFiscalYear | null ?? undefined,
        search: (query) => svc.searchYears(query).map((r: unknown) => r as unknown as DevFiscalYear),
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): FiscalYearProvider {
  const KEY = 'erp_dev_fiscal_years'
  const load = (): DevFiscalYear[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  }
  return {
    getAll: () => load().filter(s => !s.isDeleted),
    getById: (id) => load().find(s => s._id === id && !s.isDeleted),
    search: (query) => {
      const q = query.toLowerCase()
      return load().filter(c => !c.isDeleted && (c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)))
    },
  }
}

export interface UseFiscalYearsResult {
  years: DevFiscalYear[]
  loading: boolean
  error: string | null
  refresh: () => void
  search: (query: string) => void
}

export function useFiscalYears(): UseFiscalYearsResult {
  const [years, setYears] = useState<DevFiscalYear[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => { if (active) { setYears(p.getAll()); setError(null) } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const search = useCallback((query: string) => {
    getProvider().then((svc) => { setYears(svc.search(query)); setError(null) })
  }, [])

  return { years, loading, error, refresh, search }
}
