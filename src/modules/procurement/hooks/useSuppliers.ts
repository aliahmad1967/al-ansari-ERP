import { useCallback, useEffect, useState } from 'react'

interface DevSupplier {
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
  taxNumber: string | null
  paymentTerms: string | null
  currency: string
  rating: number
  notes: string | null
  status: string
  isActive: boolean
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

type SupplierInput = Record<string, unknown>

interface SupplierProvider {
  getAll(): DevSupplier[]
  getById(id: string): DevSupplier | undefined
  create(input: SupplierInput): DevSupplier
  update(id: string, changes: SupplierInput): DevSupplier | undefined
  archive(id: string): boolean
  restore(id: string): boolean
  search(query: string): DevSupplier[]
}

let providerPromise: Promise<SupplierProvider> | null = null

function getProvider(): Promise<SupplierProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/procurement/services/SupplierService')
      const svc = new mod.SupplierService()
      return {
        getAll: () => svc.findAllSuppliers().map((r: unknown) => r as unknown as DevSupplier),
        getById: (id) => svc.findSupplierById(id) as unknown as DevSupplier | null ?? undefined,
        create: (input) => svc.createSupplier(input as never) as unknown as DevSupplier,
        update: (id, changes) => svc.updateSupplier(id, changes as never) as unknown as DevSupplier,
        archive: (id) => svc.archiveSupplier(id),
        restore: (id) => svc.restoreSupplier(id),
        search: (query) => svc.searchSuppliers(query).map((r: unknown) => r as unknown as DevSupplier),
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): SupplierProvider {
  const KEY = 'erp_dev_suppliers'
  const load = (): DevSupplier[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  }
  const save = (data: DevSupplier[]) => localStorage.setItem(KEY, JSON.stringify(data))
  const genId = () => Math.random().toString(36).substring(2, 15)
  const now = () => new Date().toISOString()
  return {
    getAll: () => load().filter(s => !s.isDeleted),
    getById: (id) => load().find(s => s._id === id && !s.isDeleted),
    create: (input) => {
      const data = load()
      const s: DevSupplier = {
        _id: genId(), code: (input.code as string) || '', name: (input.name as string) || '',
        nameAr: (input.nameAr as string) || null, contactPerson: (input.contactPerson as string) || null,
        contactPersonAr: (input.contactPersonAr as string) || null, email: (input.email as string) || null,
        phone: (input.phone as string) || null, phone2: (input.phone2 as string) || null,
        address: (input.address as string) || null, addressAr: (input.addressAr as string) || null,
        taxNumber: (input.taxNumber as string) || null, paymentTerms: (input.paymentTerms as string) || null,
        currency: (input.currency as string) || 'SAR', rating: (input.rating as number) || 0,
        notes: (input.notes as string) || null, status: (input.status as string) || 'active',
        isActive: true, isDeleted: false, deletedAt: null, createdAt: now(), updatedAt: now(),
      }
      data.push(s); save(data); return s
    },
    update: (id, changes) => {
      const data = load(); const idx = data.findIndex(s => s._id === id)
      if (idx === -1) return undefined
      data[idx] = { ...data[idx], ...changes, updatedAt: now() } as DevSupplier
      save(data); return data[idx]
    },
    archive: (id) => {
      const data = load(); const s = data.find(x => x._id === id)
      if (!s) return false; s.isDeleted = true; s.deletedAt = now(); save(data); return true
    },
    restore: (id) => {
      const data = load(); const s = data.find(x => x._id === id)
      if (!s) return false; s.isDeleted = false; s.deletedAt = null; save(data); return true
    },
    search: (query) => {
      const q = query.toLowerCase()
      return load().filter(s => !s.isDeleted && (s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)))
    },
  }
}

export interface UseSuppliersResult {
  suppliers: DevSupplier[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: SupplierInput) => void
  update: (id: string, changes: SupplierInput) => void
  archive: (id: string) => void
  restore: (id: string) => void
  search: (query: string) => void
}

export function useSuppliers(): UseSuppliersResult {
  const [suppliers, setSuppliers] = useState<DevSupplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => { if (active) { setSuppliers(p.getAll()); setError(null) } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const create = useCallback((input: SupplierInput) => {
    getProvider().then((svc) => { svc.create(input); refresh() })
  }, [refresh])
  const update = useCallback((id: string, changes: SupplierInput) => {
    getProvider().then((svc) => { svc.update(id, changes); refresh() })
  }, [refresh])
  const archive = useCallback((id: string) => {
    getProvider().then((svc) => { svc.archive(id); refresh() })
  }, [refresh])
  const restore = useCallback((id: string) => {
    getProvider().then((svc) => { svc.restore(id); refresh() })
  }, [refresh])
  const search = useCallback((query: string) => {
    getProvider().then((svc) => { setSuppliers(svc.search(query)); setError(null) })
  }, [])

  return { suppliers, loading, error, refresh, create, update, archive, restore, search }
}
