import { useCallback, useEffect, useState } from 'react'

interface DevDepreciationSchedule {
  _id: string
  assetId: string
  periodStart: string
  periodEnd: string
  depreciationAmount: number
  accumulatedDepreciation: number
  bookValue: number
  status: string
  journalEntryId: string | null
  finalizedAt: string | null
  finalizedByUserId: string | null
  createdAt: string
  updatedAt: string
  isDeleted: boolean
  deletedAt: string | null
}

interface DepreciationScheduleProvider {
  getAll(): DevDepreciationSchedule[]
  getById(id: string): DevDepreciationSchedule | undefined
  search(query: string): DevDepreciationSchedule[]
}

let providerPromise: Promise<DepreciationScheduleProvider> | null = null

function getProvider(): Promise<DepreciationScheduleProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/assets/services/DepreciationService')
      const svc = new mod.DepreciationService()
      return {
        getAll: () => svc.findAllSchedules().map((r: unknown) => r as unknown as DevDepreciationSchedule),
        getById: (id) => svc.findScheduleById(id) as unknown as DevDepreciationSchedule | null ?? undefined,
        search: (query) => {
          const q = query.toLowerCase()
          return svc.findAllSchedules()
            .map((r: unknown) => r as unknown as DevDepreciationSchedule)
            .filter(s => s.status.toLowerCase().includes(q) || s.assetId.toLowerCase().includes(q))
        },
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): DepreciationScheduleProvider {
  const KEY = 'erp_dev_depreciation_schedules'
  const load = (): DevDepreciationSchedule[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  }
  return {
    getAll: () => load().filter(s => !s.isDeleted),
    getById: (id) => load().find(s => s._id === id && !s.isDeleted),
    search: (query) => {
      const q = query.toLowerCase()
      return load().filter(c => !c.isDeleted && (c.status.toLowerCase().includes(q) || c.assetId.toLowerCase().includes(q)))
    },
  }
}

export interface UseDepreciationSchedulesResult {
  schedules: DevDepreciationSchedule[]
  loading: boolean
  error: string | null
  refresh: () => void
  search: (query: string) => void
}

export function useDepreciationSchedules(): UseDepreciationSchedulesResult {
  const [schedules, setSchedules] = useState<DevDepreciationSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => { if (active) { setSchedules(p.getAll()); setError(null) } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const search = useCallback((query: string) => {
    getProvider().then((svc) => { setSchedules(svc.search(query)); setError(null) })
  }, [])

  return { schedules, loading, error, refresh, search }
}
