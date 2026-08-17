import { useCallback, useEffect, useState } from 'react'

interface DevPurchaseOrder {
  _id: string
  code: string
  orderDate: string
  supplierId: string
  purchaseRequestId: string | null
  expectedDeliveryDate: string | null
  status: string
  totalAmount: number
  taxAmount: number
  discountAmount: number
  netAmount: number
  currency: string
  notes: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

type PurchaseOrderInput = Record<string, unknown>

interface PurchaseOrderProvider {
  getAll(): DevPurchaseOrder[]
  getById(id: string): DevPurchaseOrder | undefined
  create(input: PurchaseOrderInput): DevPurchaseOrder
  submit(id: string): DevPurchaseOrder | undefined
  confirm(id: string): DevPurchaseOrder | undefined
  cancel(id: string): DevPurchaseOrder | undefined
}

let providerPromise: Promise<PurchaseOrderProvider> | null = null

function getProvider(): Promise<PurchaseOrderProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/procurement/services/PurchaseOrderService')
      const svc = new mod.PurchaseOrderService()
      return {
        getAll: () => svc.findAllOrders().map((r: unknown) => r as unknown as DevPurchaseOrder),
        getById: (id) => svc.findOrderById(id) as unknown as DevPurchaseOrder | null ?? undefined,
        create: (input) => svc.createOrder(input as never, [], undefined, undefined) as unknown as DevPurchaseOrder,
        submit: (id) => svc.submitOrder(id) as unknown as DevPurchaseOrder,
        confirm: (id) => svc.confirmOrder(id) as unknown as DevPurchaseOrder,
        cancel: (id) => svc.cancelOrder(id) as unknown as DevPurchaseOrder,
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): PurchaseOrderProvider {
  const KEY = 'erp_dev_purchase_orders'
  const load = (): DevPurchaseOrder[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  }
  const save = (data: DevPurchaseOrder[]) => localStorage.setItem(KEY, JSON.stringify(data))
  const genId = () => Math.random().toString(36).substring(2, 15)
  const now = () => new Date().toISOString()
  return {
    getAll: () => load().filter(s => !s.isDeleted),
    getById: (id) => load().find(s => s._id === id && !s.isDeleted),
    create: (input) => {
      const data = load()
      const s: DevPurchaseOrder = {
        _id: genId(), code: (input.code as string) || '', orderDate: (input.orderDate as string) || now(),
        supplierId: (input.supplierId as string) || '', purchaseRequestId: (input.purchaseRequestId as string) || null,
        expectedDeliveryDate: (input.expectedDeliveryDate as string) || null, status: 'draft',
        totalAmount: (input.totalAmount as number) || 0, taxAmount: (input.taxAmount as number) || 0,
        discountAmount: (input.discountAmount as number) || 0, netAmount: (input.netAmount as number) || 0,
        currency: (input.currency as string) || 'SAR', notes: (input.notes as string) || null,
        isDeleted: false, deletedAt: null, createdAt: now(), updatedAt: now(),
      }
      data.push(s); save(data); return s
    },
    submit: (id) => {
      const data = load(); const s = data.find(x => x._id === id)
      if (!s) return undefined; s.status = 'submitted'; s.updatedAt = now()
      save(data); return s
    },
    confirm: (id) => {
      const data = load(); const s = data.find(x => x._id === id)
      if (!s) return undefined; s.status = 'confirmed'; s.updatedAt = now()
      save(data); return s
    },
    cancel: (id) => {
      const data = load(); const s = data.find(x => x._id === id)
      if (!s) return undefined; s.status = 'cancelled'; s.updatedAt = now()
      save(data); return s
    },
  }
}

export interface UsePurchaseOrdersResult {
  orders: DevPurchaseOrder[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: PurchaseOrderInput) => void
  submit: (id: string) => void
  confirm: (id: string) => void
  cancel: (id: string) => void
}

export function usePurchaseOrders(): UsePurchaseOrdersResult {
  const [orders, setOrders] = useState<DevPurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => { if (active) { setOrders(p.getAll()); setError(null) } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const create = useCallback((input: PurchaseOrderInput) => {
    getProvider().then((svc) => { svc.create(input); refresh() })
  }, [refresh])
  const submit = useCallback((id: string) => {
    getProvider().then((svc) => { svc.submit(id); refresh() })
  }, [refresh])
  const confirm = useCallback((id: string) => {
    getProvider().then((svc) => { svc.confirm(id); refresh() })
  }, [refresh])
  const cancel = useCallback((id: string) => {
    getProvider().then((svc) => { svc.cancel(id); refresh() })
  }, [refresh])

  return { orders, loading, error, refresh, create, submit, confirm, cancel }
}
