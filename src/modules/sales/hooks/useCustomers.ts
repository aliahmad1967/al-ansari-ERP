import { useCallback, useEffect, useState } from 'react'

interface DevCustomer {
  _id: string
  code: string
  name: string
  nameAr: string | null
  contactPerson: string | null
  contactPersonAr: string | null
  email: string | null
  phone: string | null
  phone2: string | null
  address: string | null
  addressAr: string | null
  city: string | null
  country: string | null
  taxNumber: string | null
  paymentTerms: string | null
  creditLimit: number
  currency: string
  balance: number
  notes: string | null
  status: string
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

type CustomerInput = Record<string, unknown>

interface CustomerProvider {
  getAll(): DevCustomer[]
  getById(id: string): DevCustomer | undefined
  create(input: CustomerInput): DevCustomer
  update(id: string, changes: CustomerInput): DevCustomer | undefined
  archive(id: string): boolean
  restore(id: string): boolean
  search(query: string): DevCustomer[]
}

let providerPromise: Promise<CustomerProvider> | null = null

function getProvider(): Promise<CustomerProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/sales/services/CustomerService')
      const svc = new mod.CustomerService()
      return {
        getAll: () => svc.findAllCustomers().map((r: unknown) => r as unknown as DevCustomer),
        getById: (id) => svc.findCustomerById(id) as unknown as DevCustomer | null ?? undefined,
        create: (input) => svc.createCustomer(input as never) as unknown as DevCustomer,
        update: (id, changes) => svc.updateCustomer(id, changes as never) as unknown as DevCustomer,
        archive: (id) => svc.archiveCustomer(id),
        restore: (id) => svc.restoreCustomer(id),
        search: (query) => svc.searchCustomers(query).map((r: unknown) => r as unknown as DevCustomer),
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): CustomerProvider {
  const KEY = 'erp_dev_customers'
  const load = (): DevCustomer[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  }
  const save = (data: DevCustomer[]) => localStorage.setItem(KEY, JSON.stringify(data))
  const genId = () => Math.random().toString(36).substring(2, 15)
  const now = () => new Date().toISOString()
  return {
    getAll: () => load().filter(s => !s.isDeleted),
    getById: (id) => load().find(s => s._id === id && !s.isDeleted),
    create: (input) => {
      const data = load()
      const c: DevCustomer = {
        _id: genId(), code: (input.code as string) || '', name: (input.name as string) || '',
        nameAr: (input.nameAr as string) || null, contactPerson: (input.contactPerson as string) || null,
        contactPersonAr: (input.contactPersonAr as string) || null, email: (input.email as string) || null,
        phone: (input.phone as string) || null, phone2: (input.phone2 as string) || null,
        address: (input.address as string) || null, addressAr: (input.addressAr as string) || null,
        city: (input.city as string) || null, country: (input.country as string) || null,
        taxNumber: (input.taxNumber as string) || null, paymentTerms: (input.paymentTerms as string) || null,
        creditLimit: (input.creditLimit as number) || 0, currency: (input.currency as string) || 'SAR',
        balance: 0, notes: (input.notes as string) || null, status: (input.status as string) || 'active',
        isDeleted: false, deletedAt: null, createdAt: now(), updatedAt: now(),
      }
      data.push(c); save(data); return c
    },
    update: (id, changes) => {
      const data = load(); const idx = data.findIndex(c => c._id === id)
      if (idx === -1) return undefined
      data[idx] = { ...data[idx], ...changes, updatedAt: now() } as DevCustomer
      save(data); return data[idx]
    },
    archive: (id) => {
      const data = load(); const c = data.find(x => x._id === id)
      if (!c) return false; c.isDeleted = true; c.deletedAt = now(); save(data); return true
    },
    restore: (id) => {
      const data = load(); const c = data.find(x => x._id === id)
      if (!c) return false; c.isDeleted = false; c.deletedAt = null; save(data); return true
    },
    search: (query) => {
      const q = query.toLowerCase()
      return load().filter(c => !c.isDeleted && (c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)))
    },
  }
}

export interface UseCustomersResult {
  customers: DevCustomer[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: CustomerInput) => void
  update: (id: string, changes: CustomerInput) => void
  archive: (id: string) => void
  restore: (id: string) => void
  search: (query: string) => void
}

export function useCustomers(): UseCustomersResult {
  const [customers, setCustomers] = useState<DevCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => { if (active) { setCustomers(p.getAll()); setError(null) } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const create = useCallback((input: CustomerInput) => {
    getProvider().then((svc) => { svc.create(input); refresh() })
  }, [refresh])
  const update = useCallback((id: string, changes: CustomerInput) => {
    getProvider().then((svc) => { svc.update(id, changes); refresh() })
  }, [refresh])
  const archive = useCallback((id: string) => {
    getProvider().then((svc) => { svc.archive(id); refresh() })
  }, [refresh])
  const restore = useCallback((id: string) => {
    getProvider().then((svc) => { svc.restore(id); refresh() })
  }, [refresh])
  const search = useCallback((query: string) => {
    getProvider().then((svc) => { setCustomers(svc.search(query)); setError(null) })
  }, [])

  return { customers, loading, error, refresh, create, update, archive, restore, search }
}
