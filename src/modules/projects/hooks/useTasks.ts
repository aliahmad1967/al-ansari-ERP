import { useCallback, useEffect, useState } from 'react'

interface DevTask {
  _id: string
  projectId: string
  milestoneId: string | null
  taskCode: string
  title: string
  titleAr: string | null
  description: string | null
  descriptionAr: string | null
  status: string
  priority: string
  assignedToId: string | null
  parentTaskId: string | null
  estimatedHours: number
  loggedHours: number
  startDate: string | null
  dueDate: string | null
  completedAt: string | null
  tags: string | null
  notes: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

type TaskInput = Record<string, unknown>

interface TaskProvider {
  getTasks(): DevTask[]
  getTask(id: string): DevTask | undefined
  createTask(input: TaskInput): DevTask
  updateTask(id: string, changes: TaskInput): DevTask | undefined
  archiveTask(id: string): boolean
  restoreTask(id: string): boolean
  getTaskCount(): number
}

let providerPromise: Promise<TaskProvider> | null = null

function getProvider(): Promise<TaskProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/projects/services/TaskService')
      const svc = new mod.TaskService()
      return {
        getTasks: () => svc.findAll().map((r) => r as unknown as DevTask),
        getTask: (id) => (svc.findById(id) as unknown as DevTask | null) ?? undefined,
        createTask: (input) => svc.create(input as never) as unknown as DevTask,
        updateTask: (id, changes) => svc.update(id, changes as never) as unknown as DevTask,
        archiveTask: (id) => svc.archive(id),
        restoreTask: (id) => svc.restore(id),
        getTaskCount: () => svc.count(),
      }
    } catch {
      return {
        getTasks: () => [],
        getTask: () => undefined,
        createTask: (input) => ({ _id: 'dev', ...input } as unknown as DevTask),
        updateTask: () => undefined,
        archiveTask: () => false,
        restoreTask: () => false,
        getTaskCount: () => 0,
      }
    }
  })()
  return providerPromise
}

export interface UseTasksResult {
  items: DevTask[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: TaskInput) => void
  update: (id: string, changes: TaskInput) => void
  archive: (id: string) => void
  restore: (id: string) => void
  totalCount: number
}

export function useTasks(): UseTasksResult {
  const [items, setItems] = useState<DevTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => {
        if (active) {
          setItems(p.getTasks())
          setTotalCount(p.getTaskCount())
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
    (input: TaskInput) => {
      getProvider().then((svc) => {
        svc.createTask(input)
        refresh()
      })
    },
    [refresh],
  )

  const update = useCallback(
    (id: string, changes: TaskInput) => {
      getProvider().then((svc) => {
        svc.updateTask(id, changes)
        refresh()
      })
    },
    [refresh],
  )

  const archive = useCallback(
    (id: string) => {
      getProvider().then((svc) => {
        svc.archiveTask(id)
        refresh()
      })
    },
    [refresh],
  )

  const restore = useCallback(
    (id: string) => {
      getProvider().then((svc) => {
        svc.restoreTask(id)
        refresh()
      })
    },
    [refresh],
  )

  return { items, loading, error, refresh, create, update, archive, restore, totalCount }
}
