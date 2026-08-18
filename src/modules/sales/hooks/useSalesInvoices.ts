import { useCallback, useEffect, useState } from 'react'

interface DevSalesInvoice {
  _id: string
  code: string
  invoiceDate: string
  dueDate: string
  customerId: string
  salesOrderId: string | null
  deliveryId: string | null
  referenceNumber: string | null
  totalAmount: number
  taxAmount: number
  discountAmount: number
  netAmount: number
  paidAmount: number
  currency: string
  status: string
  notes: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

type SalesInvoiceInput = Record<string, unknown>

interface SalesInvoiceProvider {
  getAll(): DevSalesInvoice[]
  getById(id: string): DevSalesInvoice | undefined
  create(input: SalesInvoiceInput): DevSalesInvoice
  archive(id: string): boolean
  search(query: string): DevSalesInvoice[]
}

let providerPromise: Promise<SalesInvoiceProvider> | null = null

function getProvider(): Promise<SalesInvoiceProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/sales/services/SalesInvoiceService')
      const svc = new mod.SalesInvoiceService()
      return {
        getAll: () => svc.findAllInvoices().map((r: unknown) => r as unknown as DevSalesInvoice),
        getById: (id) => svc.findInvoiceById(id) as unknown as DevSalesInvoice | null ?? undefined,
        create: (input) => svc.createInvoice(input as never, [], 1) as unknown as DevSalesInvoice,
        archive: (id) => svc.archiveInvoice(id),
        search: (query) => svc.searchInvoices(query).map((r: unknown) => r as unknown as DevSalesInvoice),
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): SalesInvoiceProvider {
  const KEY = 'erp_dev_sales_invoices'
  const load = (): DevSalesInvoice[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  }
  const save = (data: DevSalesInvoice[]) => localStorage.setItem(KEY, JSON.stringify(data))
  const genId = () => Math.random().toString(36).substring(2, 15)
  const now = () => new Date().toISOString()
  return {
    getAll: () => load().filter(s => !s.isDeleted),
    getById: (id) => load().find(s => s._id === id && !s.isDeleted),
    create: (input) => {
      const data = load()
      const i: DevSalesInvoice = {
        _id: genId(), code: `SINV-${String(data.length + 1).padStart(6, '0')}`,
        invoiceDate: (input.invoiceDate as string) || now(),
        dueDate: (input.dueDate as string) || now(),
        customerId: (input.customerId as string) || '',
        salesOrderId: (input.salesOrderId as string) || null,
        deliveryId: (input.deliveryId as string) || null,
        referenceNumber: (input.referenceNumber as string) || null,
        totalAmount: (input.totalAmount as number) || 0, taxAmount: (input.taxAmount as number) || 0,
        discountAmount: (input.discountAmount as number) || 0, netAmount: (input.netAmount as number) || 0,
        paidAmount: (input.paidAmount as number) || 0,
        currency: (input.currency as string) || 'SAR', status: (input.status as string) || 'draft',
        notes: (input.notes as string) || null, isDeleted: false, deletedAt: null,
        createdAt: now(), updatedAt: now(),
      }
      data.push(i); save(data); return i
    },
    archive: (id) => {
      const data = load(); const i = data.find(x => x._id === id)
      if (!i) return false; i.isDeleted = true; i.deletedAt = now(); save(data); return true
    },
    search: (query) => {
      const q = query.toLowerCase()
      return load().filter(x => !x.isDeleted && (x.code.toLowerCase().includes(q)))
    },
  }
}

export interface UseSalesInvoicesResult {
  invoices: DevSalesInvoice[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: SalesInvoiceInput) => void
  archive: (id: string) => void
  search: (query: string) => void
}

export function useSalesInvoices(): UseSalesInvoicesResult {
  const [invoices, setInvoices] = useState<DevSalesInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => { if (active) { setInvoices(p.getAll()); setError(null) } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const create = useCallback((input: SalesInvoiceInput) => {
    getProvider().then((svc) => { svc.create(input); refresh() })
  }, [refresh])
  const archive = useCallback((id: string) => {
    getProvider().then((svc) => { svc.archive(id); refresh() })
  }, [refresh])
  const search = useCallback((query: string) => {
    getProvider().then((svc) => { setInvoices(svc.search(query)); setError(null) })
  }, [])

  return { invoices, loading, error, refresh, create, archive, search }
}
