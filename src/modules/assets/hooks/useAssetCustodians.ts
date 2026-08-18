import { useCallback, useEffect, useState } from 'react'

interface DevAssetCustodian {
  _id: string
  name: string
  nameAr: string
  departmentId: string | null
  email: string | null
  phone: string | null
  createdAt: string
  updatedAt: string
  isDeleted: boolean
  deletedAt: string | null
}

interface AssetCustodianProvider {
  getAll(): DevAssetCustodian[]
  getById(id: string): DevAssetCustodian | undefined
  search(query: string): DevAssetCustodian[]
}

let providerPromise: Promise<AssetCustodianProvider> | null = null

function getProvider(): Promise<AssetCustodianProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/core/repositories/AssetCustodianRepository')
      const repo = new mod.AssetCustodianRepository()
      return {
        getAll: () => repo.findAll().map((r: unknown) => r as unknown as DevAssetCustodian),
        getById: (id) => repo.findById(id) as unknown as DevAssetCustodian | null ?? undefined,
        search: (query) => repo.search(query).map((r: unknown) => r as unknown as DevAssetCustodian),
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): AssetCustodianProvider {
  const KEY = 'erp_dev_asset_custodians'
  const load = (): DevAssetCustodian[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  }
  return {
    getAll: () => load().filter(s => !s.isDeleted),
    getById: (id) => load().find(s => s._id === id && !s.isDeleted),
    search: (query) => {
      const q = query.toLowerCase()
      return load().filter(c => !c.isDeleted && (c.name.toLowerCase().includes(q) || c.nameAr.toLowerCase().includes(q)))
    },
  }
}

export interface UseAssetCustodiansResult {
  custodians: DevAssetCustodian[]
  loading: boolean
  error: string | null
  refresh: () => void
  search: (query: string) => void
}

export function useAssetCustodians(): UseAssetCustodiansResult {
  const [custodians, setCustodians] = useState<DevAssetCustodian[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => { if (active) { setCustodians(p.getAll()); setError(null) } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const search = useCallback((query: string) => {
    getProvider().then((svc) => { setCustodians(svc.search(query)); setError(null) })
  }, [])

  return { custodians, loading, error, refresh, search }
}
