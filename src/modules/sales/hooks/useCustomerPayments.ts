import { useCallback, useEffect, useState } from 'react'

interface DevCustomerPayment {
  _id: string
  code: string
  paymentDate: string
  salesInvoiceId: string
  customerId: string
  amount: number
  paymentMethod: string
  referenceNumber: string | null
  status: string
  notes: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

type CustomerPaymentInput = Record<string, unknown>

interface CustomerPaymentProvider {
  getAll(): DevCustomerPayment[]
  getById(id: string): DevCustomerPayment | undefined
  create(input: CustomerPaymentInput): DevCustomerPayment
  archive(id: string): boolean
  search(query: string): DevCustomerPayment[]
}

let providerPromise: Promise<CustomerPaymentProvider> | null = null

function getProvider(): Promise<CustomerPaymentProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/sales/services/CustomerPaymentService')
      const svc = new mod.CustomerPaymentService()
      return {
        getAll: () => svc.findAllPayments().map((r: unknown) => r as unknown as DevCustomerPayment),
        getById: (id) => svc.findPaymentById(id) as unknown as DevCustomerPayment | null ?? undefined,
        create: (input) => svc.createPayment(input as never, 1) as unknown as DevCustomerPayment,
        archive: (id) => svc.archivePayment(id),
        search: (query) => svc.searchPayments(query).map((r: unknown) => r as unknown as DevCustomerPayment),
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): CustomerPaymentProvider {
  const KEY = 'erp_dev_customer_payments'
  const load = (): DevCustomerPayment[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  }
  const save = (data: DevCustomerPayment[]) => localStorage.setItem(KEY, JSON.stringify(data))
  const genId = () => Math.random().toString(36).substring(2, 15)
  const now = () => new Date().toISOString()
  return {
    getAll: () => load().filter(s => !s.isDeleted),
    getById: (id) => load().find(s => s._id === id && !s.isDeleted),
    create: (input) => {
      const data = load()
      const p: DevCustomerPayment = {
        _id: genId(), code: `CPAY-${String(data.length + 1).padStart(6, '0')}`,
        paymentDate: (input.paymentDate as string) || now(),
        salesInvoiceId: (input.salesInvoiceId as string) || '',
        customerId: (input.customerId as string) || '',
        amount: (input.amount as number) || 0,
        paymentMethod: (input.paymentMethod as string) || 'cash',
        referenceNumber: (input.referenceNumber as string) || null,
        status: (input.status as string) || 'draft',
        notes: (input.notes as string) || null, isDeleted: false, deletedAt: null,
        createdAt: now(), updatedAt: now(),
      }
      data.push(p); save(data); return p
    },
    archive: (id) => {
      const data = load(); const p = data.find(x => x._id === id)
      if (!p) return false; p.isDeleted = true; p.deletedAt = now(); save(data); return true
    },
    search: (query) => {
      const q = query.toLowerCase()
      return load().filter(x => !x.isDeleted && (x.code.toLowerCase().includes(q)))
    },
  }
}

export interface UseCustomerPaymentsResult {
  payments: DevCustomerPayment[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: CustomerPaymentInput) => void
  archive: (id: string) => void
  search: (query: string) => void
}

export function useCustomerPayments(): UseCustomerPaymentsResult {
  const [payments, setPayments] = useState<DevCustomerPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => { if (active) { setPayments(p.getAll()); setError(null) } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const create = useCallback((input: CustomerPaymentInput) => {
    getProvider().then((svc) => { svc.create(input); refresh() })
  }, [refresh])
  const archive = useCallback((id: string) => {
    getProvider().then((svc) => { svc.archive(id); refresh() })
  }, [refresh])
  const search = useCallback((query: string) => {
    getProvider().then((svc) => { setPayments(svc.search(query)); setError(null) })
  }, [])

  return { payments, loading, error, refresh, create, archive, search }
}
