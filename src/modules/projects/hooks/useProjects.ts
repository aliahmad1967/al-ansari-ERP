import { useCallback, useEffect, useState } from 'react'

interface DevProject {
  _id: string
  projectCode: string
  name: string
  nameAr: string | null
  description: string | null
  descriptionAr: string | null
  status: string
  priority: string
  startDate: string | null
  endDate: string | null
  actualEndDate: string | null
  managerId: string | null
  customerId: string | null
  organizationId: string | null
  branchId: string | null
  departmentId: string | null
  budget: number
  spentBudget: number
  progress: number
  notes: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

type ProjectInput = Record<string, unknown>

interface ProjectProvider {
  getProjects(): DevProject[]
  getProject(id: string): DevProject | undefined
  createProject(input: ProjectInput): DevProject
  updateProject(id: string, changes: ProjectInput): DevProject | undefined
  archiveProject(id: string): boolean
  restoreProject(id: string): boolean
  getProjectCount(): number
  getActiveProjectCount(): number
}

let providerPromise: Promise<ProjectProvider> | null = null

function getProvider(): Promise<ProjectProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/projects/services/ProjectService')
      const svc = new mod.ProjectService()
      return {
        getProjects: () => svc.findAll().map((r) => r as unknown as DevProject),
        getProject: (id) => (svc.findById(id) as unknown as DevProject | null) ?? undefined,
        createProject: (input) => svc.create(input as never) as unknown as DevProject,
        updateProject: (id, changes) => svc.update(id, changes as never) as unknown as DevProject,
        archiveProject: (id) => svc.archive(id),
        restoreProject: (id) => svc.restore(id),
        getProjectCount: () => svc.count(),
        getActiveProjectCount: () => svc.findActive().length,
      }
    } catch {
      return {
        getProjects: () => [],
        getProject: () => undefined,
        createProject: (input) => ({ _id: 'dev', ...input } as unknown as DevProject),
        updateProject: () => undefined,
        archiveProject: () => false,
        restoreProject: () => false,
        getProjectCount: () => 0,
        getActiveProjectCount: () => 0,
      }
    }
  })()
  return providerPromise
}

export interface UseProjectsResult {
  items: DevProject[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: ProjectInput) => void
  update: (id: string, changes: ProjectInput) => void
  archive: (id: string) => void
  restore: (id: string) => void
  totalCount: number
  activeCount: number
}

export function useProjects(): UseProjectsResult {
  const [items, setItems] = useState<DevProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [activeCount, setActiveCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => {
        if (active) {
          setItems(p.getProjects())
          setTotalCount(p.getProjectCount())
          setActiveCount(p.getActiveProjectCount())
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
    (input: ProjectInput) => {
      getProvider().then((svc) => {
        svc.createProject(input)
        refresh()
      })
    },
    [refresh],
  )

  const update = useCallback(
    (id: string, changes: ProjectInput) => {
      getProvider().then((svc) => {
        svc.updateProject(id, changes)
        refresh()
      })
    },
    [refresh],
  )

  const archive = useCallback(
    (id: string) => {
      getProvider().then((svc) => {
        svc.archiveProject(id)
        refresh()
      })
    },
    [refresh],
  )

  const restore = useCallback(
    (id: string) => {
      getProvider().then((svc) => {
        svc.restoreProject(id)
        refresh()
      })
    },
    [refresh],
  )

  return { items, loading, error, refresh, create, update, archive, restore, totalCount, activeCount }
}
