import { useCallback, useEffect, useState } from 'react'
import type { InventoryCountStatusValue } from '@/core/models/InventoryCount'

interface DevInventoryCount {
  _id: string
  code: string
  warehouseId: string
  status: string
  countDate: string
  notes: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

type CountInput = Record<string, unknown>

interface InventoryCountProvider {
  getAll(): DevInventoryCount[]
  getById(id: string): DevInventoryCount | undefined
  getByStatus(status: string): DevInventoryCount[]
  create(input: CountInput): DevInventoryCount
  update(id: string, changes: CountInput): DevInventoryCount | undefined
  updateStatus(id: string, status: string): DevInventoryCount | undefined
  archive(id: string): boolean
}

let providerPromise: Promise<InventoryCountProvider> | null = null

function getProvider(): Promise<InventoryCountProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/inventory/services/InventoryCountService')
      const svc = new mod.InventoryCountService()
      return {
        getAll: () => svc.findAllCounts().map(r => r as unknown as DevInventoryCount),
        getById: (id) => svc.findCountById(id) as unknown as DevInventoryCount | null ?? undefined,
        getByStatus: (status) => svc.findCountsByStatus(status as InventoryCountStatusValue).map(r => r as unknown as DevInventoryCount),
        create: (input) => svc.createCount(input as never) as unknown as DevInventoryCount,
        update: (id, changes) => svc.updateCount(id, changes as never) as unknown as DevInventoryCount,
        updateStatus: (id, status) => svc.updateCountStatus(id, status as InventoryCountStatusValue) as unknown as DevInventoryCount | null ?? undefined,
        archive: (id) => svc.archiveCount(id),
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): InventoryCountProvider {
  const KEY = 'erp_dev_inventory_counts'
  const load = (): DevInventoryCount[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  }
  const save = (data: DevInventoryCount[]) => localStorage.setItem(KEY, JSON.stringify(data))
  const genId = () => Math.random().toString(36).substring(2, 15)
  const now = () => new Date().toISOString()
  return {
    getAll: () => load().filter(c => !c.isDeleted),
    getById: (id) => load().find(c => c._id === id && !c.isDeleted),
    getByStatus: (status) => load().filter(c => !c.isDeleted && c.status === status),
    create: (input) => {
      const data = load()
      const c: DevInventoryCount = {
        _id: genId(),
        code: (input.code as string) || '',
        warehouseId: (input.warehouseId as string) || '',
        status: (input.status as string) || 'draft',
        countDate: (input.countDate as string) || now(),
        notes: (input.notes as string) || null,
        isDeleted: false,
        deletedAt: null,
        createdAt: now(),
        updatedAt: now(),
      }
      data.push(c); save(data); return c
    },
    update: (id, changes) => {
      const data = load(); const idx = data.findIndex(c => c._id === id)
      if (idx === -1) return undefined
      data[idx] = { ...data[idx], ...changes, updatedAt: now() } as DevInventoryCount
      save(data); return data[idx]
    },
    updateStatus: (id, status) => {
      const data = load(); const idx = data.findIndex(c => c._id === id)
      if (idx === -1) return undefined
      data[idx] = { ...data[idx], status, updatedAt: now() } as DevInventoryCount
      save(data); return data[idx]
    },
    archive: (id) => {
      const data = load(); const c = data.find(x => x._id === id)
      if (!c) return false; c.isDeleted = true; c.deletedAt = now(); save(data); return true
    },
  }
}

export interface UseInventoryCountsResult {
  counts: DevInventoryCount[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: CountInput) => void
  update: (id: string, changes: CountInput) => void
  updateStatus: (id: string, status: string) => void
  archive: (id: string) => void
}

export function useInventoryCounts(): UseInventoryCountsResult {
  const [counts, setCounts] = useState<DevInventoryCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => { if (active) { setCounts(p.getAll()); setError(null) } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const create = useCallback((input: CountInput) => {
    getProvider().then((svc) => { svc.create(input); refresh() })
  }, [refresh])
  const update = useCallback((id: string, changes: CountInput) => {
    getProvider().then((svc) => { svc.update(id, changes); refresh() })
  }, [refresh])
  const updateStatus = useCallback((id: string, status: string) => {
    getProvider().then((svc) => { svc.updateStatus(id, status); refresh() })
  }, [refresh])
  const archive = useCallback((id: string) => {
    getProvider().then((svc) => { svc.archive(id); refresh() })
  }, [refresh])

  return { counts, loading, error, refresh, create, update, updateStatus, archive }
}
