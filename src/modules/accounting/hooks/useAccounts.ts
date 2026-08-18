import { useCallback, useEffect, useState } from 'react'

interface DevAccount {
  _id: string
  code: string
  name: string
  nameAr: string | null
  type: string
  parentAccountId: string | null
  accountGroupId: string | null
  level: number
  isGroup: boolean
  isActive: boolean
  currency: string
  description: string | null
  descriptionAr: string | null
  openingBalance: number
  currentBalance: number
  costCenterId: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  isDeleted: boolean
  deletedAt: string | null
}

type AccountInput = Record<string, unknown>

interface AccountProvider {
  getAll(): DevAccount[]
  getById(id: string): DevAccount | undefined
  create(input: AccountInput): DevAccount
  update(id: string, changes: AccountInput): DevAccount | undefined
  archive(id: string): boolean
  restore(id: string): boolean
  search(query: string): DevAccount[]
}

let providerPromise: Promise<AccountProvider> | null = null

function getProvider(): Promise<AccountProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/accounting/services/AccountService')
      const svc = new mod.AccountService()
      return {
        getAll: () => svc.findAllAccounts().map((r: unknown) => r as unknown as DevAccount),
        getById: (id) => svc.findAccountById(id) as unknown as DevAccount | null ?? undefined,
        create: (input) => svc.createAccount(input as never) as unknown as DevAccount,
        update: (id, changes) => svc.updateAccount(id, changes as never) as unknown as DevAccount,
        archive: (id) => svc.archiveAccount(id),
        restore: (id) => svc.restoreAccount(id),
        search: (query) => svc.searchAccounts(query).map((r: unknown) => r as unknown as DevAccount),
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): AccountProvider {
  const KEY = 'erp_dev_accounts'
  const load = (): DevAccount[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  }
  const save = (data: DevAccount[]) => localStorage.setItem(KEY, JSON.stringify(data))
  const genId = () => Math.random().toString(36).substring(2, 15)
  const now = () => new Date().toISOString()
  return {
    getAll: () => load().filter(s => !s.isDeleted),
    getById: (id) => load().find(s => s._id === id && !s.isDeleted),
    create: (input) => {
      const data = load()
      const c: DevAccount = {
        _id: genId(), code: (input.code as string) || '', name: (input.name as string) || '',
        nameAr: (input.nameAr as string) || null, type: (input.type as string) || 'asset',
        parentAccountId: (input.parentAccountId as string) || null,
        accountGroupId: (input.accountGroupId as string) || null,
        level: (input.level as number) || 0, isGroup: (input.isGroup as boolean) || false,
        isActive: true, currency: (input.currency as string) || 'SAR',
        description: (input.description as string) || null,
        descriptionAr: (input.descriptionAr as string) || null,
        openingBalance: (input.openingBalance as number) || 0,
        currentBalance: (input.currentBalance as number) || 0,
        costCenterId: (input.costCenterId as string) || null,
        notes: (input.notes as string) || null,
        isDeleted: false, deletedAt: null, createdAt: now(), updatedAt: now(),
      }
      data.push(c); save(data); return c
    },
    update: (id, changes) => {
      const data = load(); const idx = data.findIndex(c => c._id === id)
      if (idx === -1) return undefined
      data[idx] = { ...data[idx], ...changes, updatedAt: now() } as DevAccount
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

export interface UseAccountsResult {
  accounts: DevAccount[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: AccountInput) => void
  update: (id: string, changes: AccountInput) => void
  archive: (id: string) => void
  restore: (id: string) => void
  search: (query: string) => void
}

export function useAccounts(): UseAccountsResult {
  const [accounts, setAccounts] = useState<DevAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => { if (active) { setAccounts(p.getAll()); setError(null) } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const create = useCallback((input: AccountInput) => {
    getProvider().then((svc) => { svc.create(input); refresh() })
  }, [refresh])
  const update = useCallback((id: string, changes: AccountInput) => {
    getProvider().then((svc) => { svc.update(id, changes); refresh() })
  }, [refresh])
  const archive = useCallback((id: string) => {
    getProvider().then((svc) => { svc.archive(id); refresh() })
  }, [refresh])
  const restore = useCallback((id: string) => {
    getProvider().then((svc) => { svc.restore(id); refresh() })
  }, [refresh])
  const search = useCallback((query: string) => {
    getProvider().then((svc) => { setAccounts(svc.search(query)); setError(null) })
  }, [])

  return { accounts, loading, error, refresh, create, update, archive, restore, search }
}
