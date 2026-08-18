import { useCallback, useEffect, useState } from 'react'

interface DevAssetCategory {
  _id: string
  code: string
  name: string
  nameAr: string
  defaultUsefulLifeMonths: number
  defaultDepreciationMethod: string
  expenseAccountId: string | null
  accumulatedDepreciationAccountId: string | null
  createdAt: string
  updatedAt: string
  isDeleted: boolean
  deletedAt: string | null
}

interface AssetCategoryProvider {
  getAll(): DevAssetCategory[]
  getById(id: string): DevAssetCategory | undefined
  search(query: string): DevAssetCategory[]
}

let providerPromise: Promise<AssetCategoryProvider> | null = null

function getProvider(): Promise<AssetCategoryProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/core/repositories/AssetCategoryRepository')
      const repo = new mod.AssetCategoryRepository()
      return {
        getAll: () => repo.findAll().map((r: unknown) => r as unknown as DevAssetCategory),
        getById: (id) => repo.findById(id) as unknown as DevAssetCategory | null ?? undefined,
        search: (query) => repo.search(query).map((r: unknown) => r as unknown as DevAssetCategory),
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): AssetCategoryProvider {
  const KEY = 'erp_dev_asset_categories'
  const load = (): DevAssetCategory[] => {
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

export interface UseAssetCategoriesResult {
  categories: DevAssetCategory[]
  loading: boolean
  error: string | null
  refresh: () => void
  search: (query: string) => void
}

export function useAssetCategories(): UseAssetCategoriesResult {
  const [categories, setCategories] = useState<DevAssetCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => { if (active) { setCategories(p.getAll()); setError(null) } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const search = useCallback((query: string) => {
    getProvider().then((svc) => { setCategories(svc.search(query)); setError(null) })
  }, [])

  return { categories, loading, error, refresh, search }
}
