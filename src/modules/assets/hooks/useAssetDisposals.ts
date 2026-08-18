import { useCallback, useEffect, useState } from 'react'

interface DevAssetDisposal {
  _id: string
  assetId: string
  disposalDate: string
  disposalMethod: string
  disposalValue: number
  gainLoss: number
  reason: string
  status: string
  journalEntryId: string | null
  approvedBy: string | null
  approvedAt: string | null
  createdAt: string
  updatedAt: string
  isDeleted: boolean
  deletedAt: string | null
}

interface AssetDisposalProvider {
  getAll(): DevAssetDisposal[]
  getById(id: string): DevAssetDisposal | undefined
  search(query: string): DevAssetDisposal[]
}

let providerPromise: Promise<AssetDisposalProvider> | null = null

function getProvider(): Promise<AssetDisposalProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/assets/services/AssetDisposalService')
      const svc = new mod.AssetDisposalService()
      return {
        getAll: () => svc.findAllDisposals().map((r: unknown) => r as unknown as DevAssetDisposal),
        getById: (id) => svc.findDisposalById(id) as unknown as DevAssetDisposal | null ?? undefined,
        search: (query) => svc.searchDisposals(query).map((r: unknown) => r as unknown as DevAssetDisposal),
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): AssetDisposalProvider {
  const KEY = 'erp_dev_asset_disposals'
  const load = (): DevAssetDisposal[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  }
  return {
    getAll: () => load().filter(s => !s.isDeleted),
    getById: (id) => load().find(s => s._id === id && !s.isDeleted),
    search: (query) => {
      const q = query.toLowerCase()
      return load().filter(c => !c.isDeleted && c.reason.toLowerCase().includes(q))
    },
  }
}

export interface UseAssetDisposalsResult {
  disposals: DevAssetDisposal[]
  loading: boolean
  error: string | null
  refresh: () => void
  search: (query: string) => void
}

export function useAssetDisposals(): UseAssetDisposalsResult {
  const [disposals, setDisposals] = useState<DevAssetDisposal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => { if (active) { setDisposals(p.getAll()); setError(null) } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const search = useCallback((query: string) => {
    getProvider().then((svc) => { setDisposals(svc.search(query)); setError(null) })
  }, [])

  return { disposals, loading, error, refresh, search }
}
