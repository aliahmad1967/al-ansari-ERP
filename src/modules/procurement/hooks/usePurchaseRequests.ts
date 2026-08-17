import { useCallback, useEffect, useState } from 'react'

interface DevPurchaseRequest {
  _id: string
  code: string
  requestDate: string
  requestedByUserId: string
  departmentId: string | null
  status: string
  totalEstimatedCost: number
  notes: string | null
  approvedByUserId: string | null
  approvedAt: string | null
  rejectionReason: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

type PurchaseRequestInput = Record<string, unknown>

interface PurchaseRequestProvider {
  getAll(): DevPurchaseRequest[]
  getById(id: string): DevPurchaseRequest | undefined
  create(input: PurchaseRequestInput): DevPurchaseRequest
  approve(id: string, userId: string, username: string): DevPurchaseRequest | undefined
  reject(id: string, reason: string, userId: string, username: string): DevPurchaseRequest | undefined
  cancel(id: string): DevPurchaseRequest | undefined
}

let providerPromise: Promise<PurchaseRequestProvider> | null = null

function getProvider(): Promise<PurchaseRequestProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/procurement/services/PurchaseRequestService')
      const svc = new mod.PurchaseRequestService()
      return {
        getAll: () => svc.findAllRequests().map((r: unknown) => r as unknown as DevPurchaseRequest),
        getById: (id) => svc.findRequestById(id) as unknown as DevPurchaseRequest | null ?? undefined,
        create: (input) => svc.createRequest(input as never, [], undefined, undefined) as unknown as DevPurchaseRequest,
        approve: (id, userId, username) => svc.approveRequest(id, userId, username) as unknown as DevPurchaseRequest,
        reject: (id, reason, userId, username) => svc.rejectRequest(id, reason, userId, username) as unknown as DevPurchaseRequest,
        cancel: (id) => svc.cancelRequest(id) as unknown as DevPurchaseRequest,
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): PurchaseRequestProvider {
  const KEY = 'erp_dev_purchase_requests'
  const load = (): DevPurchaseRequest[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  }
  const save = (data: DevPurchaseRequest[]) => localStorage.setItem(KEY, JSON.stringify(data))
  const genId = () => Math.random().toString(36).substring(2, 15)
  const now = () => new Date().toISOString()
  return {
    getAll: () => load().filter(s => !s.isDeleted),
    getById: (id) => load().find(s => s._id === id && !s.isDeleted),
    create: (input) => {
      const data = load()
      const s: DevPurchaseRequest = {
        _id: genId(), code: (input.code as string) || '', requestDate: (input.requestDate as string) || now(),
        requestedByUserId: (input.requestedByUserId as string) || '', departmentId: (input.departmentId as string) || null,
        status: 'pending', totalEstimatedCost: (input.totalEstimatedCost as number) || 0,
        notes: (input.notes as string) || null, approvedByUserId: null, approvedAt: null,
        rejectionReason: null, isDeleted: false, deletedAt: null, createdAt: now(), updatedAt: now(),
      }
      data.push(s); save(data); return s
    },
    approve: (id, userId) => {
      const data = load(); const s = data.find(x => x._id === id)
      if (!s) return undefined
      s.status = 'approved'; s.approvedByUserId = userId; s.approvedAt = now(); s.updatedAt = now()
      save(data); return s
    },
    reject: (id, reason, userId) => {
      const data = load(); const s = data.find(x => x._id === id)
      if (!s) return undefined
      s.status = 'rejected'; s.rejectionReason = reason; s.approvedByUserId = userId; s.updatedAt = now()
      save(data); return s
    },
    cancel: (id) => {
      const data = load(); const s = data.find(x => x._id === id)
      if (!s) return undefined; s.status = 'cancelled'; s.updatedAt = now()
      save(data); return s
    },
  }
}

export interface UsePurchaseRequestsResult {
  requests: DevPurchaseRequest[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: PurchaseRequestInput) => void
  approve: (id: string, userId: string, username: string) => void
  reject: (id: string, reason: string, userId: string, username: string) => void
  cancel: (id: string) => void
}

export function usePurchaseRequests(): UsePurchaseRequestsResult {
  const [requests, setRequests] = useState<DevPurchaseRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => { if (active) { setRequests(p.getAll()); setError(null) } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const create = useCallback((input: PurchaseRequestInput) => {
    getProvider().then((svc) => { svc.create(input); refresh() })
  }, [refresh])
  const approve = useCallback((id: string, userId: string, username: string) => {
    getProvider().then((svc) => { svc.approve(id, userId, username); refresh() })
  }, [refresh])
  const reject = useCallback((id: string, reason: string, userId: string, username: string) => {
    getProvider().then((svc) => { svc.reject(id, reason, userId, username); refresh() })
  }, [refresh])
  const cancel = useCallback((id: string) => {
    getProvider().then((svc) => { svc.cancel(id); refresh() })
  }, [refresh])

  return { requests, loading, error, refresh, create, approve, reject, cancel }
}
