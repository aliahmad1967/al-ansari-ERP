import { useCallback, useEffect, useState } from 'react'

interface DevAsset {
  _id: string
  code: string
  name: string
  nameAr: string
  description: string | null
  categoryId: string
  locationId: string | null
  custodianId: string | null
  purchaseValue: number
  salvageValue: number
  usefulLifeMonths: number
  depreciationMethod: string
  acquisitionDate: string
  disposalDate: string | null
  status: string
  serialNumber: string | null
  model: string | null
  manufacturer: string | null
  journalEntryId: string | null
  lastDepreciationDate: string | null
  createdAt: string
  updatedAt: string
  isDeleted: boolean
  deletedAt: string | null
}

interface AssetProvider {
  getAll(): DevAsset[]
  getById(id: string): DevAsset | undefined
  search(query: string): DevAsset[]
}

let providerPromise: Promise<AssetProvider> | null = null

function getProvider(): Promise<AssetProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/assets/services/AssetService')
      const svc = new mod.AssetService()
      return {
        getAll: () => svc.findAllAssets().map((r: unknown) => r as unknown as DevAsset),
        getById: (id) => svc.findAssetById(id) as unknown as DevAsset | null ?? undefined,
        search: (query) => svc.searchAssets(query).map((r: unknown) => r as unknown as DevAsset),
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): AssetProvider {
  const KEY = 'erp_dev_assets'
  const load = (): DevAsset[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  }
  return {
    getAll: () => load().filter(s => !s.isDeleted),
    getById: (id) => load().find(s => s._id === id && !s.isDeleted),
    search: (query) => {
      const q = query.toLowerCase()
      return load().filter(c => !c.isDeleted && (c.name.toLowerCase().includes(q) || c.nameAr.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || (c.serialNumber != null && c.serialNumber.toLowerCase().includes(q))))
    },
  }
}

export interface UseAssetsResult {
  assets: DevAsset[]
  loading: boolean
  error: string | null
  refresh: () => void
  search: (query: string) => void
}

export function useAssets(): UseAssetsResult {
  const [assets, setAssets] = useState<DevAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => { if (active) { setAssets(p.getAll()); setError(null) } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const search = useCallback((query: string) => {
    getProvider().then((svc) => { setAssets(svc.search(query)); setError(null) })
  }, [])

  return { assets, loading, error, refresh, search }
}
