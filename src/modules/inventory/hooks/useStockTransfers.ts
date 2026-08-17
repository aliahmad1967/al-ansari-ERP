import { useCallback, useEffect, useState } from 'react'
import type { StockTransferStatusValue } from '@/core/models/StockTransfer'

interface DevStockTransfer {
  _id: string
  code: string
  fromWarehouseId: string
  toWarehouseId: string
  status: string
  notes: string | null
  expectedArrivalDate: string | null
  actualArrivalDate: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

type TransferInput = Record<string, unknown>

interface StockTransferProvider {
  getAll(): DevStockTransfer[]
  getById(id: string): DevStockTransfer | undefined
  getByStatus(status: string): DevStockTransfer[]
  create(input: TransferInput): DevStockTransfer
  updateStatus(id: string, status: string): DevStockTransfer | undefined
  cancel(id: string): boolean
}

let providerPromise: Promise<StockTransferProvider> | null = null

function getProvider(): Promise<StockTransferProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/inventory/services/InventoryTransferService')
      const svc = new mod.InventoryTransferService()
      return {
        getAll: () => svc.findAllTransfers().map(r => r as unknown as DevStockTransfer),
        getById: (id) => svc.findTransferById(id) as unknown as DevStockTransfer | null ?? undefined,
        getByStatus: (status) => svc.findTransfersByStatus(status as StockTransferStatusValue).map(r => r as unknown as DevStockTransfer),
        create: (input) => svc.createTransfer(input as never) as unknown as DevStockTransfer,
        updateStatus: (id, status) => svc.updateTransferStatus(id, status as StockTransferStatusValue) as unknown as DevStockTransfer | null ?? undefined,
        cancel: (id) => { svc.cancelTransfer(id); return true },
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): StockTransferProvider {
  const KEY = 'erp_dev_stock_transfers'
  const load = (): DevStockTransfer[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  }
  const save = (data: DevStockTransfer[]) => localStorage.setItem(KEY, JSON.stringify(data))
  const genId = () => Math.random().toString(36).substring(2, 15)
  const now = () => new Date().toISOString()
  return {
    getAll: () => load().filter(t => !t.isDeleted),
    getById: (id) => load().find(t => t._id === id && !t.isDeleted),
    getByStatus: (status) => load().filter(t => !t.isDeleted && t.status === status),
    create: (input) => {
      const data = load()
      const t: DevStockTransfer = {
        _id: genId(),
        code: (input.code as string) || '',
        fromWarehouseId: (input.fromWarehouseId as string) || '',
        toWarehouseId: (input.toWarehouseId as string) || '',
        status: (input.status as string) || 'draft',
        notes: (input.notes as string) || null,
        expectedArrivalDate: (input.expectedArrivalDate as string) || null,
        actualArrivalDate: null,
        isDeleted: false,
        deletedAt: null,
        createdAt: now(),
        updatedAt: now(),
      }
      data.push(t); save(data); return t
    },
    updateStatus: (id, status) => {
      const data = load(); const idx = data.findIndex(t => t._id === id)
      if (idx === -1) return undefined
      const current = data[idx]
      if (!current) return undefined
      data[idx] = {
        ...current,
        status,
        actualArrivalDate: status === 'received' ? now() : current.actualArrivalDate,
        updatedAt: now(),
      } as DevStockTransfer
      save(data); return data[idx]
    },
    cancel: (id) => {
      const data = load(); const t = data.find(x => x._id === id)
      if (!t) return false
      t.status = 'cancelled'; t.updatedAt = now(); save(data); return true
    },
  }
}

export interface UseStockTransfersResult {
  transfers: DevStockTransfer[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: TransferInput) => void
  updateStatus: (id: string, status: string) => void
  cancel: (id: string) => void
}

export function useStockTransfers(): UseStockTransfersResult {
  const [transfers, setTransfers] = useState<DevStockTransfer[]>([])
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
  const create = useCallback((input: TransferInput) => {
    getProvider().then((svc) => { svc.create(input); refresh() })
  }, [refresh])
  const updateStatus = useCallback((id: string, status: string) => {
    getProvider().then((svc) => { svc.updateStatus(id, status); refresh() })
  }, [refresh])
  const cancel = useCallback((id: string) => {
    getProvider().then((svc) => { svc.cancel(id); refresh() })
  }, [refresh])

  return { transfers, loading, error, refresh, create, updateStatus, cancel }
}
