import { useCallback, useEffect, useState } from 'react'

interface DevPayrollPeriod {
  _id: string
  name: string
  nameAr: string | null
  startDate: string
  endDate: string
  year: number
  month: number
  status: string
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

type PeriodInput = Record<string, unknown>

interface PeriodProvider {
  getAll(): DevPayrollPeriod[]
  getById(id: string): DevPayrollPeriod | undefined
  create(input: PeriodInput): DevPayrollPeriod
  updateStatus(id: string, status: string): DevPayrollPeriod | undefined
  archive(id: string): boolean
}

let providerPromise: Promise<PeriodProvider> | null = null

function getProvider(): Promise<PeriodProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/hr/services/PayrollPeriodService')
      const svc = new mod.PayrollPeriodService()
      return {
        getAll: () => svc.findAll().map(r => r as unknown as DevPayrollPeriod),
        getById: (id) => svc.findById(id) as unknown as DevPayrollPeriod | null ?? undefined,
        create: (input) => svc.create(input as never) as unknown as DevPayrollPeriod,
        updateStatus: (id, status) => svc.updateStatus(id, status as never) as unknown as DevPayrollPeriod,
        archive: (id) => svc.archive(id),
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): PeriodProvider {
  const KEY = 'erp_dev_payroll_periods'
  const load = (): DevPayrollPeriod[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  }
  const save = (data: DevPayrollPeriod[]) => localStorage.setItem(KEY, JSON.stringify(data))
  const genId = () => Math.random().toString(36).substring(2, 15)
  const now = () => new Date().toISOString()
  return {
    getAll: () => load().filter(p => !p.isDeleted),
    getById: (id) => load().find(p => p._id === id && !p.isDeleted),
    create: (input) => {
      const data = load()
      const p: DevPayrollPeriod = {
        _id: genId(), name: (input.name as string) || '', nameAr: (input.nameAr as string) || null,
        startDate: String(input.startDate || now()), endDate: String(input.endDate || now()),
        year: (input.year as number) || new Date().getFullYear(),
        month: (input.month as number) || new Date().getMonth() + 1,
        status: 'draft', isDeleted: false, deletedAt: null, createdAt: now(), updatedAt: now(),
      }
      data.push(p); save(data); return p
    },
    updateStatus: (id, status) => {
      const data = load(); const idx = data.findIndex(p => p._id === id)
      if (idx === -1) return undefined
      data[idx] = { ...data[idx], status, updatedAt: now() } as DevPayrollPeriod
      save(data); return data[idx]
    },
    archive: (id) => {
      const data = load(); const p = data.find(x => x._id === id)
      if (!p) return false; p.isDeleted = true; p.deletedAt = now(); save(data); return true
    },
  }
}

export interface UsePayrollPeriodsResult {
  items: DevPayrollPeriod[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: PeriodInput) => void
  updateStatus: (id: string, status: string) => void
  archive: (id: string) => void
}

export function usePayrollPeriods(): UsePayrollPeriodsResult {
  const [items, setItems] = useState<DevPayrollPeriod[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => { if (active) { setItems(p.getAll()); setError(null) } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const create = useCallback((input: PeriodInput) => {
    getProvider().then((svc) => { svc.create(input); refresh() })
  }, [refresh])
  const updateStatus = useCallback((id: string, status: string) => {
    getProvider().then((svc) => { svc.updateStatus(id, status); refresh() })
  }, [refresh])
  const archive = useCallback((id: string) => {
    getProvider().then((svc) => { svc.archive(id); refresh() })
  }, [refresh])

  return { items, loading, error, refresh, create, updateStatus, archive }
}
