import { useCallback, useEffect, useState } from 'react'

interface DevCostCenter {
  _id: string
  code: string
  name: string
  nameAr: string | null
  description: string | null
  descriptionAr: string | null
  parentCostCenterId: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  isDeleted: boolean
  deletedAt: string | null
}

type CostCenterInput = Record<string, unknown>

interface CostCenterProvider {
  getAll(): DevCostCenter[]
  getById(id: string): DevCostCenter | undefined
  create(input: CostCenterInput): DevCostCenter
  update(id: string, changes: CostCenterInput): DevCostCenter | undefined
  archive(id: string): boolean
  restore(id: string): boolean
  search(query: string): DevCostCenter[]
}

let providerPromise: Promise<CostCenterProvider> | null = null

function getProvider(): Promise<CostCenterProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/accounting/services/CostCenterService')
      const svc = new mod.CostCenterService()
      return {
        getAll: () => svc.findAll().map((r: unknown) => r as unknown as DevCostCenter),
        getById: (id) => svc.findById(id) as unknown as DevCostCenter | null ?? undefined,
        create: (input) => svc.create(input as never) as unknown as DevCostCenter,
        update: (id, changes) => svc.update(id, changes as never) as unknown as DevCostCenter,
        archive: (id) => svc.archive(id),
        restore: (id) => svc.restore(id),
        search: (query) => svc.search(query).map((r: unknown) => r as unknown as DevCostCenter),
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): CostCenterProvider {
  const KEY = 'erp_dev_cost_centers'
  const load = (): DevCostCenter[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  }
  const save = (data: DevCostCenter[]) => localStorage.setItem(KEY, JSON.stringify(data))
  const genId = () => Math.random().toString(36).substring(2, 15)
  const now = () => new Date().toISOString()
  return {
    getAll: () => load().filter(s => !s.isDeleted),
    getById: (id) => load().find(s => s._id === id && !s.isDeleted),
    create: (input) => {
      const data = load()
      const c: DevCostCenter = {
        _id: genId(), code: (input.code as string) || '', name: (input.name as string) || '',
        nameAr: (input.nameAr as string) || null, description: (input.description as string) || null,
        descriptionAr: (input.descriptionAr as string) || null,
        parentCostCenterId: (input.parentCostCenterId as string) || null,
        isActive: true, isDeleted: false, deletedAt: null, createdAt: now(), updatedAt: now(),
      }
      data.push(c); save(data); return c
    },
    update: (id, changes) => {
      const data = load(); const idx = data.findIndex(c => c._id === id)
      if (idx === -1) return undefined
      data[idx] = { ...data[idx], ...changes, updatedAt: now() } as DevCostCenter
      save(data); return data[idx]
    },
    archive: (id) => {
      const data = load(); const c = data.find(x => x._id === id)
      if (!c) return false; c.isDeleted = true; c.deletedAt = now(); save(data); return true
    },
    restore: (id) => {
      const data = load(); const c = data.find(x => x._id === id)
      if (!c) return false; c.isDeleted = false; c.deletedAt = null; save(data); return true
    },
    search: (query) => {
      const q = query.toLowerCase()
      return load().filter(c => !c.isDeleted && (c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)))
    },
  }
}

export interface UseCostCentersResult {
  costCenters: DevCostCenter[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: CostCenterInput) => void
  update: (id: string, changes: CostCenterInput) => void
  archive: (id: string) => void
  restore: (id: string) => void
  search: (query: string) => void
}

export function useCostCenters(): UseCostCentersResult {
  const [costCenters, setCostCenters] = useState<DevCostCenter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => { if (active) { setCostCenters(p.getAll()); setError(null) } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const create = useCallback((input: CostCenterInput) => {
    getProvider().then((svc) => { svc.create(input); refresh() })
  }, [refresh])
  const update = useCallback((id: string, changes: CostCenterInput) => {
    getProvider().then((svc) => { svc.update(id, changes); refresh() })
  }, [refresh])
  const archive = useCallback((id: string) => {
    getProvider().then((svc) => { svc.archive(id); refresh() })
  }, [refresh])
  const restore = useCallback((id: string) => {
    getProvider().then((svc) => { svc.restore(id); refresh() })
  }, [refresh])
  const search = useCallback((query: string) => {
    getProvider().then((svc) => { setCostCenters(svc.search(query)); setError(null) })
  }, [])

  return { costCenters, loading, error, refresh, create, update, archive, restore, search }
}
