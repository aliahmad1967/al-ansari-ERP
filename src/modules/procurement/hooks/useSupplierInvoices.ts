import { useCallback, useEffect, useState } from 'react'
import type { SupplierPaymentMethodValue } from '@/core/models/SupplierPayment'

interface DevSupplierInvoice {
  _id: string
  code: string
  invoiceDate: string
  supplierId: string
  purchaseOrderId: string
  goodsReceiptId: string | null
  invoiceNumber: string
  totalAmount: number
  taxAmount: number
  discountAmount: number
  netAmount: number
  dueDate: string
  paidAmount: number
  status: string
  notes: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

type SupplierInvoiceInput = Record<string, unknown>

interface SupplierInvoiceProvider {
  getAll(): DevSupplierInvoice[]
  getById(id: string): DevSupplierInvoice | undefined
  create(input: SupplierInvoiceInput): DevSupplierInvoice
  register(id: string): DevSupplierInvoice | undefined
  validate(id: string): DevSupplierInvoice | undefined
  recordPayment(invoiceId: string, amount: number, method: string, ref: string, date: string): DevSupplierInvoice | undefined
  getPayments(invoiceId: string): Array<{ amount: number; method: string; reference: string; date: string }>
}

let providerPromise: Promise<SupplierInvoiceProvider> | null = null

function getProvider(): Promise<SupplierInvoiceProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/procurement/services/SupplierInvoiceService')
      const svc = new mod.SupplierInvoiceService()
      return {
        getAll: () => svc.findAllInvoices().map((r: unknown) => r as unknown as DevSupplierInvoice),
        getById: (id) => svc.findInvoiceById(id) as unknown as DevSupplierInvoice | null ?? undefined,
        create: (input) => svc.createInvoice(input as never) as unknown as DevSupplierInvoice,
        register: (id) => svc.registerInvoice(id) as unknown as DevSupplierInvoice,
        validate: (id) => svc.validateInvoice(id) as unknown as DevSupplierInvoice,
        recordPayment: (invoiceId, amount, method, ref, date) => svc.recordPayment(invoiceId, amount, method as SupplierPaymentMethodValue, ref, new Date(date)) as unknown as DevSupplierInvoice,
        getPayments: (invoiceId) => svc.findPaymentsByInvoice(invoiceId) as unknown as Array<{ amount: number; method: string; reference: string; date: string }>,
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): SupplierInvoiceProvider {
  const KEY = 'erp_dev_supplier_invoices'
  const PAY_KEY = 'erp_dev_supplier_invoice_payments'
  const load = (): DevSupplierInvoice[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  }
  const save = (data: DevSupplierInvoice[]) => localStorage.setItem(KEY, JSON.stringify(data))
  const loadPayments = (): Record<string, Array<{ amount: number; method: string; reference: string; date: string }>> => {
    try { return JSON.parse(localStorage.getItem(PAY_KEY) ?? '{}') } catch { return {} }
  }
  const savePayments = (data: Record<string, Array<{ amount: number; method: string; reference: string; date: string }>>) => localStorage.setItem(PAY_KEY, JSON.stringify(data))
  const genId = () => Math.random().toString(36).substring(2, 15)
  const now = () => new Date().toISOString()
  return {
    getAll: () => load().filter(s => !s.isDeleted),
    getById: (id) => load().find(s => s._id === id && !s.isDeleted),
    create: (input) => {
      const data = load()
      const s: DevSupplierInvoice = {
        _id: genId(), code: (input.code as string) || '', invoiceDate: (input.invoiceDate as string) || now(),
        supplierId: (input.supplierId as string) || '', purchaseOrderId: (input.purchaseOrderId as string) || '',
        goodsReceiptId: (input.goodsReceiptId as string) || null, invoiceNumber: (input.invoiceNumber as string) || '',
        totalAmount: (input.totalAmount as number) || 0, taxAmount: (input.taxAmount as number) || 0,
        discountAmount: (input.discountAmount as number) || 0, netAmount: (input.netAmount as number) || 0,
        dueDate: (input.dueDate as string) || '', paidAmount: 0, status: 'draft',
        notes: (input.notes as string) || null, isDeleted: false, deletedAt: null, createdAt: now(), updatedAt: now(),
      }
      data.push(s); save(data); return s
    },
    register: (id) => {
      const data = load(); const s = data.find(x => x._id === id)
      if (!s) return undefined; s.status = 'registered'; s.updatedAt = now()
      save(data); return s
    },
    validate: (id) => {
      const data = load(); const s = data.find(x => x._id === id)
      if (!s) return undefined; s.status = 'validated'; s.updatedAt = now()
      save(data); return s
    },
    recordPayment: (invoiceId, amount, method, ref, date) => {
      const data = load(); const s = data.find(x => x._id === invoiceId)
      if (!s) return undefined
      s.paidAmount += amount; s.updatedAt = now()
      if (s.paidAmount >= s.netAmount) s.status = 'paid'
      save(data)
      const payments = loadPayments()
      if (!payments[invoiceId]) payments[invoiceId] = []
      payments[invoiceId].push({ amount, method, reference: ref, date })
      savePayments(payments)
      return s
    },
    getPayments: (invoiceId) => {
      const payments = loadPayments()
      return payments[invoiceId] || []
    },
  }
}

export interface UseSupplierInvoicesResult {
  invoices: DevSupplierInvoice[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: SupplierInvoiceInput) => void
  register: (id: string) => void
  validate: (id: string) => void
  recordPayment: (invoiceId: string, amount: number, method: string, ref: string, date: string) => void
  getPayments: (invoiceId: string) => Array<{ amount: number; method: string; reference: string; date: string }>
}

export function useSupplierInvoices(): UseSupplierInvoicesResult {
  const [invoices, setInvoices] = useState<DevSupplierInvoice[]>([])
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
  const create = useCallback((input: SupplierInvoiceInput) => {
    getProvider().then((svc) => { svc.create(input); refresh() })
  }, [refresh])
  const register = useCallback((id: string) => {
    getProvider().then((svc) => { svc.register(id); refresh() })
  }, [refresh])
  const validate = useCallback((id: string) => {
    getProvider().then((svc) => { svc.validate(id); refresh() })
  }, [refresh])
  const recordPayment = useCallback((invoiceId: string, amount: number, method: string, ref: string, date: string) => {
    getProvider().then((svc) => { svc.recordPayment(invoiceId, amount, method, ref, date); refresh() })
  }, [refresh])
  const getPayments = useCallback((invoiceId: string) => {
    const payments = loadPaymentsSync()
    return payments[invoiceId] || []
  }, [])

  return { invoices, loading, error, refresh, create, register, validate, recordPayment, getPayments }
}

function loadPaymentsSync(): Record<string, Array<{ amount: number; method: string; reference: string; date: string }>> {
  try { return JSON.parse(localStorage.getItem('erp_dev_supplier_invoice_payments') ?? '{}') } catch { return {} }
}
