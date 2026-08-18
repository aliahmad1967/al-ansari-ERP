import { useCallback, useEffect, useState } from 'react'

interface DevProjectExpense {
  _id: string
  projectId: string
  taskId: string | null
  employeeId: string | null
  category: string
  description: string
  descriptionAr: string | null
  amount: number
  currency: string
  expenseDate: string
  receiptUrl: string | null
  status: string
  notes: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

type ProjectExpenseInput = Record<string, unknown>

interface ProjectExpenseProvider {
  getExpenses(): DevProjectExpense[]
  getExpense(id: string): DevProjectExpense | undefined
  createExpense(input: ProjectExpenseInput): DevProjectExpense
  updateExpense(id: string, changes: ProjectExpenseInput): DevProjectExpense | undefined
  archiveExpense(id: string): boolean
  restoreExpense(id: string): boolean
  getExpenseCount(): number
}

let providerPromise: Promise<ProjectExpenseProvider> | null = null

function getProvider(): Promise<ProjectExpenseProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/projects/services/ProjectExpenseService')
      const svc = new mod.ProjectExpenseService()
      return {
        getExpenses: () => svc.findAll().map((r) => r as unknown as DevProjectExpense),
        getExpense: (id) => (svc.findById(id) as unknown as DevProjectExpense | null) ?? undefined,
        createExpense: (input) => svc.create(input as never) as unknown as DevProjectExpense,
        updateExpense: (id, changes) => svc.update(id, changes as never) as unknown as DevProjectExpense,
        archiveExpense: (id) => svc.archive(id),
        restoreExpense: (id) => svc.restore(id),
        getExpenseCount: () => svc.count(),
      }
    } catch {
      return {
        getExpenses: () => [],
        getExpense: () => undefined,
        createExpense: (input) => ({ _id: 'dev', ...input } as unknown as DevProjectExpense),
        updateExpense: () => undefined,
        archiveExpense: () => false,
        restoreExpense: () => false,
        getExpenseCount: () => 0,
      }
    }
  })()
  return providerPromise
}

export interface UseProjectExpensesResult {
  items: DevProjectExpense[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: ProjectExpenseInput) => void
  update: (id: string, changes: ProjectExpenseInput) => void
  archive: (id: string) => void
  restore: (id: string) => void
  totalCount: number
}

export function useProjectExpenses(): UseProjectExpensesResult {
  const [items, setItems] = useState<DevProjectExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => {
        if (active) {
          setItems(p.getExpenses())
          setTotalCount(p.getExpenseCount())
          setError(null)
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Unknown error')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  const create = useCallback(
    (input: ProjectExpenseInput) => {
      getProvider().then((svc) => {
        svc.createExpense(input)
        refresh()
      })
    },
    [refresh],
  )

  const update = useCallback(
    (id: string, changes: ProjectExpenseInput) => {
      getProvider().then((svc) => {
        svc.updateExpense(id, changes)
        refresh()
      })
    },
    [refresh],
  )

  const archive = useCallback(
    (id: string) => {
      getProvider().then((svc) => {
        svc.archiveExpense(id)
        refresh()
      })
    },
    [refresh],
  )

  const restore = useCallback(
    (id: string) => {
      getProvider().then((svc) => {
        svc.restoreExpense(id)
        refresh()
      })
    },
    [refresh],
  )

  return { items, loading, error, refresh, create, update, archive, restore, totalCount }
}
