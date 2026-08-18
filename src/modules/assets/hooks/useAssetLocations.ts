import { useCallback, useEffect, useState } from 'react'

interface DevAssetLocation {
  _id: string
  code: string
  name: string
  nameAr: string
  address: string | null
  branchId: string | null
  createdAt: string
  updatedAt: string
  isDeleted: boolean
  deletedAt: string | null
}

interface AssetLocationProvider {
  getAll(): DevAssetLocation[]
  getById(id: string): DevAssetLocation | undefined
  search(query: string): DevAssetLocation[]
}

let providerPromise: Promise<AssetLocationProvider> | null = null

function getProvider(): Promise<AssetLocationProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/core/repositories/AssetLocationRepository')
      const repo = new mod.AssetLocationRepository()
      return {
        getAll: () => repo.findAll().map((r: unknown) => r as unknown as DevAssetLocation),
        getById: (id) => repo.findById(id) as unknown as DevAssetLocation | null ?? undefined,
        search: (query) => repo.search(query).map((r: unknown) => r as unknown as DevAssetLocation),
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): AssetLocationProvider {
  const KEY = 'erp_dev_asset_locations'
  const load = (): DevAssetLocation[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  }
  return {
    getAll: () => load().filter(s => !s.isDeleted),
    getById: (id) => load().find(s => s._id === id && !s.isDeleted),
    search: (query) => {
      const q = query.toLowerCase()
      return load().filter(c => !c.isDeleted && (c.name.toLowerCase().includes(q) || c.nameAr.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)))
    },
  }
}

export interface UseAssetLocationsResult {
  locations: DevAssetLocation[]
  loading: boolean
  error: string | null
  refresh: () => void
  search: (query: string) => void
}

export function useAssetLocations(): UseAssetLocationsResult {
  const [locations, setLocations] = useState<DevAssetLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => { if (active) { setLocations(p.getAll()); setError(null) } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const search = useCallback((query: string) => {
    getProvider().then((svc) => { setLocations(svc.search(query)); setError(null) })
  }, [])

  return { locations, loading, error, refresh, search }
}
