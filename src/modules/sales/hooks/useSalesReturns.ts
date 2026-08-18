import { useCallback, useEffect, useState } from 'react'

interface DevSalesReturn {
  _id: string
  code: string
  returnDate: string
  salesInvoiceId: string
  salesOrderId: string | null
  customerId: string
  warehouseId: string
  reason: string
  totalAmount: number
  taxAmount: number
  netAmount: number
  currency: string
  status: string
  notes: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

type SalesReturnInput = Record<string, unknown>

interface SalesReturnProvider {
  getAll(): DevSalesReturn[]
  getById(id: string): DevSalesReturn | undefined
  create(input: SalesReturnInput): DevSalesReturn
  archive(id: string): boolean
  search(query: string): DevSalesReturn[]
}

let providerPromise: Promise<SalesReturnProvider> | null = null

function getProvider(): Promise<SalesReturnProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/sales/services/SalesReturnService')
      const svc = new mod.SalesReturnService()
      return {
        getAll: () => svc.findAllReturns().map((r: unknown) => r as unknown as DevSalesReturn),
        getById: (id) => svc.findReturnById(id) as unknown as DevSalesReturn | null ?? undefined,
        create: (input) => svc.createReturn(input as never, [], 1) as unknown as DevSalesReturn,
        archive: (id) => svc.archiveReturn(id),
        search: (query) => svc.searchReturns(query).map((r: unknown) => r as unknown as DevSalesReturn),
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): SalesReturnProvider {
  const KEY = 'erp_dev_sales_returns'
  const load = (): DevSalesReturn[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  }
  const save = (data: DevSalesReturn[]) => localStorage.setItem(KEY, JSON.stringify(data))
  const genId = () => Math.random().toString(36).substring(2, 15)
  const now = () => new Date().toISOString()
  return {
    getAll: () => load().filter(s => !s.isDeleted),
    getById: (id) => load().find(s => s._id === id && !s.isDeleted),
    create: (input) => {
      const data = load()
      const r: DevSalesReturn = {
        _id: genId(), code: `SR-${String(data.length + 1).padStart(6, '0')}`,
        returnDate: (input.returnDate as string) || now(),
        salesInvoiceId: (input.salesInvoiceId as string) || '',
        salesOrderId: (input.salesOrderId as string) || null,
        customerId: (input.customerId as string) || '',
        warehouseId: (input.warehouseId as string) || '',
        reason: (input.reason as string) || '',
        totalAmount: (input.totalAmount as number) || 0, taxAmount: (input.taxAmount as number) || 0,
        netAmount: (input.netAmount as number) || 0,
        currency: (input.currency as string) || 'SAR', status: (input.status as string) || 'draft',
        notes: (input.notes as string) || null, isDeleted: false, deletedAt: null,
        createdAt: now(), updatedAt: now(),
      }
      data.push(r); save(data); return r
    },
    archive: (id) => {
      const data = load(); const r = data.find(x => x._id === id)
      if (!r) return false; r.isDeleted = true; r.deletedAt = now(); save(data); return true
    },
    search: (query) => {
      const q = query.toLowerCase()
      return load().filter(x => !x.isDeleted && (x.code.toLowerCase().includes(q)))
    },
  }
}

export interface UseSalesReturnsResult {
  salesReturns: DevSalesReturn[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: SalesReturnInput) => void
  archive: (id: string) => void
  search: (query: string) => void
}

export function useSalesReturns(): UseSalesReturnsResult {
  const [salesReturns, setSalesReturns] = useState<DevSalesReturn[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => { if (active) { setSalesReturns(p.getAll()); setError(null) } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const create = useCallback((input: SalesReturnInput) => {
    getProvider().then((svc) => { svc.create(input); refresh() })
  }, [refresh])
  const archive = useCallback((id: string) => {
    getProvider().then((svc) => { svc.archive(id); refresh() })
  }, [refresh])
  const search = useCallback((query: string) => {
    getProvider().then((svc) => { setSalesReturns(svc.search(query)); setError(null) })
  }, [])

  return { salesReturns, loading, error, refresh, create, archive, search }
}
