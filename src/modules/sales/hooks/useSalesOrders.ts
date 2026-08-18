import { useCallback, useEffect, useState } from 'react'

interface DevSalesOrder {
  _id: string
  code: string
  orderDate: string
  customerId: string
  quotationId: string | null
  expectedDeliveryDate: string | null
  referenceNumber: string | null
  totalAmount: number
  taxAmount: number
  discountAmount: number
  netAmount: number
  currency: string
  status: string
  notes: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

type SalesOrderInput = Record<string, unknown>

interface SalesOrderProvider {
  getAll(): DevSalesOrder[]
  getById(id: string): DevSalesOrder | undefined
  create(input: SalesOrderInput): DevSalesOrder
  update(id: string, changes: SalesOrderInput): DevSalesOrder | undefined
  archive(id: string): boolean
  search(query: string): DevSalesOrder[]
}

let providerPromise: Promise<SalesOrderProvider> | null = null

function getProvider(): Promise<SalesOrderProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/sales/services/SalesOrderService')
      const svc = new mod.SalesOrderService()
      return {
        getAll: () => svc.findAllSalesOrders().map((r: unknown) => r as unknown as DevSalesOrder),
        getById: (id) => svc.findSalesOrderById(id) as unknown as DevSalesOrder | null ?? undefined,
        create: (input) => svc.createSalesOrder(input as never, [], 1) as unknown as DevSalesOrder,
        update: (id, changes) => svc.updateSalesOrder(id, changes as never) as unknown as DevSalesOrder,
        archive: (id) => svc.archiveSalesOrder(id),
        search: (query) => svc.searchSalesOrders(query).map((r: unknown) => r as unknown as DevSalesOrder),
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): SalesOrderProvider {
  const KEY = 'erp_dev_sales_orders'
  const load = (): DevSalesOrder[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  }
  const save = (data: DevSalesOrder[]) => localStorage.setItem(KEY, JSON.stringify(data))
  const genId = () => Math.random().toString(36).substring(2, 15)
  const now = () => new Date().toISOString()
  return {
    getAll: () => load().filter(s => !s.isDeleted),
    getById: (id) => load().find(s => s._id === id && !s.isDeleted),
    create: (input) => {
      const data = load()
      const o: DevSalesOrder = {
        _id: genId(), code: `SO-${String(data.length + 1).padStart(6, '0')}`,
        orderDate: (input.orderDate as string) || now(),
        customerId: (input.customerId as string) || '',
        quotationId: (input.quotationId as string) || null,
        expectedDeliveryDate: (input.expectedDeliveryDate as string) || null,
        referenceNumber: (input.referenceNumber as string) || null,
        totalAmount: (input.totalAmount as number) || 0, taxAmount: (input.taxAmount as number) || 0,
        discountAmount: (input.discountAmount as number) || 0, netAmount: (input.netAmount as number) || 0,
        currency: (input.currency as string) || 'SAR', status: (input.status as string) || 'draft',
        notes: (input.notes as string) || null, isDeleted: false, deletedAt: null,
        createdAt: now(), updatedAt: now(),
      }
      data.push(o); save(data); return o
    },
    update: (id, changes) => {
      const data = load(); const idx = data.findIndex(o => o._id === id)
      if (idx === -1) return undefined
      data[idx] = { ...data[idx], ...changes, updatedAt: now() } as DevSalesOrder
      save(data); return data[idx]
    },
    archive: (id) => {
      const data = load(); const o = data.find(x => x._id === id)
      if (!o) return false; o.isDeleted = true; o.deletedAt = now(); save(data); return true
    },
    search: (query) => {
      const q = query.toLowerCase()
      return load().filter(x => !x.isDeleted && (x.code.toLowerCase().includes(q)))
    },
  }
}

export interface UseSalesOrdersResult {
  salesOrders: DevSalesOrder[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: SalesOrderInput) => void
  update: (id: string, changes: SalesOrderInput) => void
  archive: (id: string) => void
  search: (query: string) => void
}

export function useSalesOrders(): UseSalesOrdersResult {
  const [salesOrders, setSalesOrders] = useState<DevSalesOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => { if (active) { setSalesOrders(p.getAll()); setError(null) } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const create = useCallback((input: SalesOrderInput) => {
    getProvider().then((svc) => { svc.create(input); refresh() })
  }, [refresh])
  const update = useCallback((id: string, changes: SalesOrderInput) => {
    getProvider().then((svc) => { svc.update(id, changes); refresh() })
  }, [refresh])
  const archive = useCallback((id: string) => {
    getProvider().then((svc) => { svc.archive(id); refresh() })
  }, [refresh])
  const search = useCallback((query: string) => {
    getProvider().then((svc) => { setSalesOrders(svc.search(query)); setError(null) })
  }, [])

  return { salesOrders, loading, error, refresh, create, update, archive, search }
}
