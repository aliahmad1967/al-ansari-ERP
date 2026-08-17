import { useCallback, useEffect, useState } from 'react'

interface DevGoodsReceipt {
  _id: string
  code: string
  receiptDate: string
  purchaseOrderId: string
  supplierId: string
  warehouseId: string
  receivedByUserId: string | null
  deliveryNoteNumber: string | null
  status: string
  notes: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

type GoodsReceiptInput = Record<string, unknown>

interface GoodsReceiptProvider {
  getAll(): DevGoodsReceipt[]
  getById(id: string): DevGoodsReceipt | undefined
  create(input: GoodsReceiptInput): DevGoodsReceipt
  markReceived(id: string): DevGoodsReceipt | undefined
  markAccepted(id: string): DevGoodsReceipt | undefined
  markRejected(id: string): DevGoodsReceipt | undefined
}

let providerPromise: Promise<GoodsReceiptProvider> | null = null

function getProvider(): Promise<GoodsReceiptProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/procurement/services/GoodsReceiptService')
      const svc = new mod.GoodsReceiptService()
      return {
        getAll: () => svc.findAllReceipts().map((r: unknown) => r as unknown as DevGoodsReceipt),
        getById: (id) => svc.findReceiptById(id) as unknown as DevGoodsReceipt | null ?? undefined,
        create: (input) => svc.createReceipt(input as never, [], undefined, undefined) as unknown as DevGoodsReceipt,
        markReceived: (id) => svc.markReceived(id) as unknown as DevGoodsReceipt,
        markAccepted: (id) => svc.markAccepted(id) as unknown as DevGoodsReceipt,
        markRejected: (id) => svc.markRejected(id) as unknown as DevGoodsReceipt,
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): GoodsReceiptProvider {
  const KEY = 'erp_dev_goods_receipts'
  const load = (): DevGoodsReceipt[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  }
  const save = (data: DevGoodsReceipt[]) => localStorage.setItem(KEY, JSON.stringify(data))
  const genId = () => Math.random().toString(36).substring(2, 15)
  const now = () => new Date().toISOString()
  return {
    getAll: () => load().filter(s => !s.isDeleted),
    getById: (id) => load().find(s => s._id === id && !s.isDeleted),
    create: (input) => {
      const data = load()
      const s: DevGoodsReceipt = {
        _id: genId(), code: (input.code as string) || '', receiptDate: (input.receiptDate as string) || now(),
        purchaseOrderId: (input.purchaseOrderId as string) || '', supplierId: (input.supplierId as string) || '',
        warehouseId: (input.warehouseId as string) || '', receivedByUserId: (input.receivedByUserId as string) || null,
        deliveryNoteNumber: (input.deliveryNoteNumber as string) || null, status: 'pending',
        notes: (input.notes as string) || null, isDeleted: false, deletedAt: null, createdAt: now(), updatedAt: now(),
      }
      data.push(s); save(data); return s
    },
    markReceived: (id) => {
      const data = load(); const s = data.find(x => x._id === id)
      if (!s) return undefined; s.status = 'received'; s.updatedAt = now()
      save(data); return s
    },
    markAccepted: (id) => {
      const data = load(); const s = data.find(x => x._id === id)
      if (!s) return undefined; s.status = 'accepted'; s.updatedAt = now()
      save(data); return s
    },
    markRejected: (id) => {
      const data = load(); const s = data.find(x => x._id === id)
      if (!s) return undefined; s.status = 'rejected'; s.updatedAt = now()
      save(data); return s
    },
  }
}

export interface UseGoodsReceiptsResult {
  receipts: DevGoodsReceipt[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: GoodsReceiptInput) => void
  markReceived: (id: string) => void
  markAccepted: (id: string) => void
  markRejected: (id: string) => void
}

export function useGoodsReceipts(): UseGoodsReceiptsResult {
  const [receipts, setReceipts] = useState<DevGoodsReceipt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => { if (active) { setReceipts(p.getAll()); setError(null) } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const create = useCallback((input: GoodsReceiptInput) => {
    getProvider().then((svc) => { svc.create(input); refresh() })
  }, [refresh])
  const markReceived = useCallback((id: string) => {
    getProvider().then((svc) => { svc.markReceived(id); refresh() })
  }, [refresh])
  const markAccepted = useCallback((id: string) => {
    getProvider().then((svc) => { svc.markAccepted(id); refresh() })
  }, [refresh])
  const markRejected = useCallback((id: string) => {
    getProvider().then((svc) => { svc.markRejected(id); refresh() })
  }, [refresh])

  return { receipts, loading, error, refresh, create, markReceived, markAccepted, markRejected }
}
