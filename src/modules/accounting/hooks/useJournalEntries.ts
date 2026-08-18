import { useCallback, useEffect, useState } from 'react'

interface DevJournalEntry {
  _id: string
  code: string
  entryDate: string
  fiscalYearId: string
  fiscalPeriodId: string
  referenceType: string
  referenceId: string | null
  referenceNumber: string | null
  description: string
  notes: string | null
  status: string
  reversalOfId: string | null
  postedAt: string | null
  postedByUserId: string | null
  reviewedAt: string | null
  reviewedByUserId: string | null
  approvedAt: string | null
  approvedByUserId: string | null
  totalDebit: number
  totalCredit: number
  currency: string
  createdByUserId: string | null
  createdAt: string
  updatedAt: string
  isDeleted: boolean
  deletedAt: string | null
}

interface JournalEntryProvider {
  getAll(): DevJournalEntry[]
  getById(id: string): DevJournalEntry | undefined
  search(query: string): DevJournalEntry[]
}

let providerPromise: Promise<JournalEntryProvider> | null = null

function getProvider(): Promise<JournalEntryProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/accounting/services/JournalEntryService')
      const svc = new mod.JournalEntryService()
      return {
        getAll: () => svc.findAllEntries().map((r: unknown) => r as unknown as DevJournalEntry),
        getById: (id) => svc.findEntryById(id) as unknown as DevJournalEntry | null ?? undefined,
        search: (query) => svc.searchEntries(query).map((r: unknown) => r as unknown as DevJournalEntry),
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): JournalEntryProvider {
  const KEY = 'erp_dev_journal_entries'
  const load = (): DevJournalEntry[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  }
  return {
    getAll: () => load().filter(s => !s.isDeleted),
    getById: (id) => load().find(s => s._id === id && !s.isDeleted),
    search: (query) => {
      const q = query.toLowerCase()
      return load().filter(c => !c.isDeleted && (c.description.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)))
    },
  }
}

export interface UseJournalEntriesResult {
  entries: DevJournalEntry[]
  loading: boolean
  error: string | null
  refresh: () => void
  search: (query: string) => void
}

export function useJournalEntries(): UseJournalEntriesResult {
  const [entries, setEntries] = useState<DevJournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => { if (active) { setEntries(p.getAll()); setError(null) } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const search = useCallback((query: string) => {
    getProvider().then((svc) => { setEntries(svc.search(query)); setError(null) })
  }, [])

  return { entries, loading, error, refresh, search }
}
