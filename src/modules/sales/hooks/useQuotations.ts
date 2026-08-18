import { useCallback, useEffect, useState } from 'react'

interface DevQuotation {
  _id: string
  code: string
  quotationDate: string
  validUntilDate: string
  customerId: string
  salesOrderId: string | null
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

type QuotationInput = Record<string, unknown>

interface QuotationProvider {
  getAll(): DevQuotation[]
  getById(id: string): DevQuotation | undefined
  create(input: QuotationInput): DevQuotation
  update(id: string, changes: QuotationInput): DevQuotation | undefined
  archive(id: string): boolean
  search(query: string): DevQuotation[]
}

let providerPromise: Promise<QuotationProvider> | null = null

function getProvider(): Promise<QuotationProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/sales/services/QuotationService')
      const svc = new mod.QuotationService()
      return {
        getAll: () => svc.findAllQuotations().map((r: unknown) => r as unknown as DevQuotation),
        getById: (id) => svc.findQuotationById(id) as unknown as DevQuotation | null ?? undefined,
        create: (input) => svc.createQuotation(input as never, [], 1) as unknown as DevQuotation,
        update: (id, changes) => svc.updateQuotation(id, changes as never) as unknown as DevQuotation,
        archive: (id) => svc.archiveQuotation(id),
        search: (query) => svc.searchQuotations(query).map((r: unknown) => r as unknown as DevQuotation),
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): QuotationProvider {
  const KEY = 'erp_dev_quotations'
  const load = (): DevQuotation[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  }
  const save = (data: DevQuotation[]) => localStorage.setItem(KEY, JSON.stringify(data))
  const genId = () => Math.random().toString(36).substring(2, 15)
  const now = () => new Date().toISOString()
  return {
    getAll: () => load().filter(s => !s.isDeleted),
    getById: (id) => load().find(s => s._id === id && !s.isDeleted),
    create: (input) => {
      const data = load()
      const q: DevQuotation = {
        _id: genId(), code: `QT-${String(data.length + 1).padStart(6, '0')}`,
        quotationDate: (input.quotationDate as string) || now(),
        validUntilDate: (input.validUntilDate as string) || now(),
        customerId: (input.customerId as string) || '',
        salesOrderId: null, referenceNumber: (input.referenceNumber as string) || null,
        totalAmount: (input.totalAmount as number) || 0, taxAmount: (input.taxAmount as number) || 0,
        discountAmount: (input.discountAmount as number) || 0, netAmount: (input.netAmount as number) || 0,
        currency: (input.currency as string) || 'SAR', status: (input.status as string) || 'draft',
        notes: (input.notes as string) || null, isDeleted: false, deletedAt: null,
        createdAt: now(), updatedAt: now(),
      }
      data.push(q); save(data); return q
    },
    update: (id, changes) => {
      const data = load(); const idx = data.findIndex(q => q._id === id)
      if (idx === -1) return undefined
      data[idx] = { ...data[idx], ...changes, updatedAt: now() } as DevQuotation
      save(data); return data[idx]
    },
    archive: (id) => {
      const data = load(); const q = data.find(x => x._id === id)
      if (!q) return false; q.isDeleted = true; q.deletedAt = now(); save(data); return true
    },
    search: (query) => {
      const q = query.toLowerCase()
      return load().filter(x => !x.isDeleted && (x.code.toLowerCase().includes(q)))
    },
  }
}

export interface UseQuotationsResult {
  quotations: DevQuotation[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: QuotationInput) => void
  update: (id: string, changes: QuotationInput) => void
  archive: (id: string) => void
  search: (query: string) => void
}

export function useQuotations(): UseQuotationsResult {
  const [quotations, setQuotations] = useState<DevQuotation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => { if (active) { setQuotations(p.getAll()); setError(null) } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const create = useCallback((input: QuotationInput) => {
    getProvider().then((svc) => { svc.create(input); refresh() })
  }, [refresh])
  const update = useCallback((id: string, changes: QuotationInput) => {
    getProvider().then((svc) => { svc.update(id, changes); refresh() })
  }, [refresh])
  const archive = useCallback((id: string) => {
    getProvider().then((svc) => { svc.archive(id); refresh() })
  }, [refresh])
  const search = useCallback((query: string) => {
    getProvider().then((svc) => { setQuotations(svc.search(query)); setError(null) })
  }, [])

  return { quotations, loading, error, refresh, create, update, archive, search }
}
