import { useCallback, useEffect, useState } from 'react'

interface DevTimesheet {
  _id: string
  projectId: string
  taskId: string | null
  employeeId: string
  date: string
  hours: number
  description: string | null
  descriptionAr: string | null
  status: string
  billable: boolean
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

type TimesheetInput = Record<string, unknown>

interface TimesheetProvider {
  getTimesheets(): DevTimesheet[]
  getTimesheet(id: string): DevTimesheet | undefined
  createTimesheet(input: TimesheetInput): DevTimesheet
  updateTimesheet(id: string, changes: TimesheetInput): DevTimesheet | undefined
  archiveTimesheet(id: string): boolean
  restoreTimesheet(id: string): boolean
  getTimesheetCount(): number
}

let providerPromise: Promise<TimesheetProvider> | null = null

function getProvider(): Promise<TimesheetProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/projects/services/TimesheetService')
      const svc = new mod.TimesheetService()
      return {
        getTimesheets: () => svc.findAll().map((r) => r as unknown as DevTimesheet),
        getTimesheet: (id) => (svc.findById(id) as unknown as DevTimesheet | null) ?? undefined,
        createTimesheet: (input) => svc.create(input as never) as unknown as DevTimesheet,
        updateTimesheet: (id, changes) => svc.update(id, changes as never) as unknown as DevTimesheet,
        archiveTimesheet: (id) => svc.archive(id),
        restoreTimesheet: (id) => svc.restore(id),
        getTimesheetCount: () => svc.count(),
      }
    } catch {
      return {
        getTimesheets: () => [],
        getTimesheet: () => undefined,
        createTimesheet: (input) => ({ _id: 'dev', ...input } as unknown as DevTimesheet),
        updateTimesheet: () => undefined,
        archiveTimesheet: () => false,
        restoreTimesheet: () => false,
        getTimesheetCount: () => 0,
      }
    }
  })()
  return providerPromise
}

export interface UseTimesheetsResult {
  items: DevTimesheet[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: TimesheetInput) => void
  update: (id: string, changes: TimesheetInput) => void
  archive: (id: string) => void
  restore: (id: string) => void
  totalCount: number
}

export function useTimesheets(): UseTimesheetsResult {
  const [items, setItems] = useState<DevTimesheet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => {
        if (active) {
          setItems(p.getTimesheets())
          setTotalCount(p.getTimesheetCount())
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
    (input: TimesheetInput) => {
      getProvider().then((svc) => {
        svc.createTimesheet(input)
        refresh()
      })
    },
    [refresh],
  )

  const update = useCallback(
    (id: string, changes: TimesheetInput) => {
      getProvider().then((svc) => {
        svc.updateTimesheet(id, changes)
        refresh()
      })
    },
    [refresh],
  )

  const archive = useCallback(
    (id: string) => {
      getProvider().then((svc) => {
        svc.archiveTimesheet(id)
        refresh()
      })
    },
    [refresh],
  )

  const restore = useCallback(
    (id: string) => {
      getProvider().then((svc) => {
        svc.restoreTimesheet(id)
        refresh()
      })
    },
    [refresh],
  )

  return { items, loading, error, refresh, create, update, archive, restore, totalCount }
}
