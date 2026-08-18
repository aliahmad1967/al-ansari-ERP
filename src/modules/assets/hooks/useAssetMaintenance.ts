import { useCallback, useEffect, useState } from 'react'

interface DevAssetMaintenance {
  _id: string
  assetId: string
  asset: string
  type: string
  description: string
  scheduledDate: string
  completedDate: string | null
  cost: number
  currency: string
  status: string
  vendor: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  isDeleted: boolean
  deletedAt: string | null
}

interface AssetMaintenanceProvider {
  getAll(): DevAssetMaintenance[]
  getById(id: string): DevAssetMaintenance | undefined
  search(query: string): DevAssetMaintenance[]
}

let providerPromise: Promise<AssetMaintenanceProvider> | null = null

function getProvider(): Promise<AssetMaintenanceProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/core/repositories/AssetMaintenanceRepository')
      const repo = new mod.AssetMaintenanceRepository()
      return {
        getAll: () => repo.findAll().map((r: unknown) => r as unknown as DevAssetMaintenance),
        getById: (id) => repo.findById(id) as unknown as DevAssetMaintenance | null ?? undefined,
        search: (query) => repo.search(query).map((r: unknown) => r as unknown as DevAssetMaintenance),
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): AssetMaintenanceProvider {
  const KEY = 'erp_dev_asset_maintenance'
  const load = (): DevAssetMaintenance[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  }
  return {
    getAll: () => load().filter(s => !s.isDeleted),
    getById: (id) => load().find(s => s._id === id && !s.isDeleted),
    search: (query) => {
      const q = query.toLowerCase()
      return load().filter(c => !c.isDeleted && (c.description.toLowerCase().includes(q) || (c.vendor != null && c.vendor.toLowerCase().includes(q))))
    },
  }
}

export interface UseAssetMaintenanceResult {
  maintenanceRecords: DevAssetMaintenance[]
  loading: boolean
  error: string | null
  refresh: () => void
  search: (query: string) => void
}

export function useAssetMaintenance(): UseAssetMaintenanceResult {
  const [maintenanceRecords, setMaintenanceRecords] = useState<DevAssetMaintenance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => { if (active) { setMaintenanceRecords(p.getAll()); setError(null) } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const search = useCallback((query: string) => {
    getProvider().then((svc) => { setMaintenanceRecords(svc.search(query)); setError(null) })
  }, [])

  return { maintenanceRecords, loading, error, refresh, search }
}
