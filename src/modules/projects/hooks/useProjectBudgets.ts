import { useCallback, useEffect, useState } from 'react'

interface DevProjectBudget {
  _id: string
  projectId: string
  name: string
  nameAr: string | null
  category: string
  allocatedAmount: number
  spentAmount: number
  status: string
  notes: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

type ProjectBudgetInput = Record<string, unknown>

interface ProjectBudgetProvider {
  getBudgets(): DevProjectBudget[]
  getBudget(id: string): DevProjectBudget | undefined
  createBudget(input: ProjectBudgetInput): DevProjectBudget
  updateBudget(id: string, changes: ProjectBudgetInput): DevProjectBudget | undefined
  archiveBudget(id: string): boolean
  restoreBudget(id: string): boolean
  getBudgetCount(): number
}

let providerPromise: Promise<ProjectBudgetProvider> | null = null

function getProvider(): Promise<ProjectBudgetProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/projects/services/ProjectBudgetService')
      const svc = new mod.ProjectBudgetService()
      return {
        getBudgets: () => svc.findAll().map((r) => r as unknown as DevProjectBudget),
        getBudget: (id) => (svc.findById(id) as unknown as DevProjectBudget | null) ?? undefined,
        createBudget: (input) => svc.create(input as never) as unknown as DevProjectBudget,
        updateBudget: (id, changes) => svc.update(id, changes as never) as unknown as DevProjectBudget,
        archiveBudget: (id) => svc.archive(id),
        restoreBudget: (id) => svc.restore(id),
        getBudgetCount: () => svc.count(),
      }
    } catch {
      return {
        getBudgets: () => [],
        getBudget: () => undefined,
        createBudget: (input) => ({ _id: 'dev', ...input } as unknown as DevProjectBudget),
        updateBudget: () => undefined,
        archiveBudget: () => false,
        restoreBudget: () => false,
        getBudgetCount: () => 0,
      }
    }
  })()
  return providerPromise
}

export interface UseProjectBudgetsResult {
  items: DevProjectBudget[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: ProjectBudgetInput) => void
  update: (id: string, changes: ProjectBudgetInput) => void
  archive: (id: string) => void
  restore: (id: string) => void
  totalCount: number
}

export function useProjectBudgets(): UseProjectBudgetsResult {
  const [items, setItems] = useState<DevProjectBudget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => {
        if (active) {
          setItems(p.getBudgets())
          setTotalCount(p.getBudgetCount())
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
    (input: ProjectBudgetInput) => {
      getProvider().then((svc) => {
        svc.createBudget(input)
        refresh()
      })
    },
    [refresh],
  )

  const update = useCallback(
    (id: string, changes: ProjectBudgetInput) => {
      getProvider().then((svc) => {
        svc.updateBudget(id, changes)
        refresh()
      })
    },
    [refresh],
  )

  const archive = useCallback(
    (id: string) => {
      getProvider().then((svc) => {
        svc.archiveBudget(id)
        refresh()
      })
    },
    [refresh],
  )

  const restore = useCallback(
    (id: string) => {
      getProvider().then((svc) => {
        svc.restoreBudget(id)
        refresh()
      })
    },
    [refresh],
  )

  return { items, loading, error, refresh, create, update, archive, restore, totalCount }
}
