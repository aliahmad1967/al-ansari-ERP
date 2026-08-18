import { useCallback, useEffect, useState } from 'react'

interface DevAssetTransfer {
  _id: string
  assetId: string
  fromLocationId: string | null
  toLocationId: string | null
  fromCustodianId: string | null
  toCustodianId: string | null
  transferDate: string
  reason: string
  status: string
  approvedBy: string | null
  approvedAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  isDeleted: boolean
  deletedAt: string | null
}

interface AssetTransferProvider {
  getAll(): DevAssetTransfer[]
  getById(id: string): DevAssetTransfer | undefined
  search(query: string): DevAssetTransfer[]
}

let providerPromise: Promise<AssetTransferProvider> | null = null

function getProvider(): Promise<AssetTransferProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/assets/services/AssetTransferService')
      const svc = new mod.AssetTransferService()
      return {
        getAll: () => svc.findAllTransfers().map((r: unknown) => r as unknown as DevAssetTransfer),
        getById: (id) => svc.findTransferById(id) as unknown as DevAssetTransfer | null ?? undefined,
        search: (query) => svc.searchTransfers(query).map((r: unknown) => r as unknown as DevAssetTransfer),
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): AssetTransferProvider {
  const KEY = 'erp_dev_asset_transfers'
  const load = (): DevAssetTransfer[] => {
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

export interface UseAssetTransfersResult {
  transfers: DevAssetTransfer[]
  loading: boolean
  error: string | null
  refresh: () => void
  search: (query: string) => void
}

export function useAssetTransfers(): UseAssetTransfersResult {
  const [transfers, setTransfers] = useState<DevAssetTransfer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => { if (active) { setTransfers(p.getAll()); setError(null) } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const search = useCallback((query: string) => {
    getProvider().then((svc) => { setTransfers(svc.search(query)); setError(null) })
  }, [])

  return { transfers, loading, error, refresh, search }
}
