import { useCallback, useEffect, useState } from 'react'

interface DevDelivery {
  _id: string
  code: string
  deliveryDate: string
  salesOrderId: string
  customerId: string
  warehouseId: string
  shippedByUserId: string | null
  trackingNumber: string | null
  carrierName: string | null
  expectedDeliveryDate: string | null
  status: string
  notes: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

type DeliveryInput = Record<string, unknown>

interface DeliveryProvider {
  getAll(): DevDelivery[]
  getById(id: string): DevDelivery | undefined
  create(input: DeliveryInput): DevDelivery
  archive(id: string): boolean
  search(query: string): DevDelivery[]
}

let providerPromise: Promise<DeliveryProvider> | null = null

function getProvider(): Promise<DeliveryProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/sales/services/DeliveryService')
      const svc = new mod.DeliveryService()
      return {
        getAll: () => svc.findAllDeliveries().map((r: unknown) => r as unknown as DevDelivery),
        getById: (id) => svc.findDeliveryById(id) as unknown as DevDelivery | null ?? undefined,
        create: (input) => svc.createDelivery(input as never, [], 1) as unknown as DevDelivery,
        archive: (id) => svc.archiveDelivery(id),
        search: (query) => svc.searchDeliveries(query).map((r: unknown) => r as unknown as DevDelivery),
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): DeliveryProvider {
  const KEY = 'erp_dev_deliveries'
  const load = (): DevDelivery[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  }
  const save = (data: DevDelivery[]) => localStorage.setItem(KEY, JSON.stringify(data))
  const genId = () => Math.random().toString(36).substring(2, 15)
  const now = () => new Date().toISOString()
  return {
    getAll: () => load().filter(s => !s.isDeleted),
    getById: (id) => load().find(s => s._id === id && !s.isDeleted),
    create: (input) => {
      const data = load()
      const d: DevDelivery = {
        _id: genId(), code: `DEL-${String(data.length + 1).padStart(6, '0')}`,
        deliveryDate: (input.deliveryDate as string) || now(),
        salesOrderId: (input.salesOrderId as string) || '',
        customerId: (input.customerId as string) || '',
        warehouseId: (input.warehouseId as string) || '',
        shippedByUserId: (input.shippedByUserId as string) || null,
        trackingNumber: (input.trackingNumber as string) || null,
        carrierName: (input.carrierName as string) || null,
        expectedDeliveryDate: (input.expectedDeliveryDate as string) || null,
        status: (input.status as string) || 'draft',
        notes: (input.notes as string) || null, isDeleted: false, deletedAt: null,
        createdAt: now(), updatedAt: now(),
      }
      data.push(d); save(data); return d
    },
    archive: (id) => {
      const data = load(); const d = data.find(x => x._id === id)
      if (!d) return false; d.isDeleted = true; d.deletedAt = now(); save(data); return true
    },
    search: (query) => {
      const q = query.toLowerCase()
      return load().filter(x => !x.isDeleted && (x.code.toLowerCase().includes(q)))
    },
  }
}

export interface UseDeliveriesResult {
  deliveries: DevDelivery[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: DeliveryInput) => void
  archive: (id: string) => void
  search: (query: string) => void
}

export function useDeliveries(): UseDeliveriesResult {
  const [deliveries, setDeliveries] = useState<DevDelivery[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => { if (active) { setDeliveries(p.getAll()); setError(null) } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const create = useCallback((input: DeliveryInput) => {
    getProvider().then((svc) => { svc.create(input); refresh() })
  }, [refresh])
  const archive = useCallback((id: string) => {
    getProvider().then((svc) => { svc.archive(id); refresh() })
  }, [refresh])
  const search = useCallback((query: string) => {
    getProvider().then((svc) => { setDeliveries(svc.search(query)); setError(null) })
  }, [])

  return { deliveries, loading, error, refresh, create, archive, search }
}
