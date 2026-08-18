import { useCallback, useEffect, useState } from 'react'

interface DevMilestone {
  _id: string
  projectId: string
  name: string
  nameAr: string | null
  description: string | null
  descriptionAr: string | null
  dueDate: string
  status: string
  completedAt: string | null
  notes: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

type MilestoneInput = Record<string, unknown>

interface MilestoneProvider {
  getMilestones(): DevMilestone[]
  getMilestone(id: string): DevMilestone | undefined
  createMilestone(input: MilestoneInput): DevMilestone
  updateMilestone(id: string, changes: MilestoneInput): DevMilestone | undefined
  archiveMilestone(id: string): boolean
  restoreMilestone(id: string): boolean
  getMilestoneCount(): number
}

let providerPromise: Promise<MilestoneProvider> | null = null

function getProvider(): Promise<MilestoneProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/projects/services/MilestoneService')
      const svc = new mod.MilestoneService()
      return {
        getMilestones: () => svc.findAll().map((r) => r as unknown as DevMilestone),
        getMilestone: (id) => (svc.findById(id) as unknown as DevMilestone | null) ?? undefined,
        createMilestone: (input) => svc.create(input as never) as unknown as DevMilestone,
        updateMilestone: (id, changes) => svc.update(id, changes as never) as unknown as DevMilestone,
        archiveMilestone: (id) => svc.archive(id),
        restoreMilestone: (id) => svc.restore(id),
        getMilestoneCount: () => svc.count(),
      }
    } catch {
      return {
        getMilestones: () => [],
        getMilestone: () => undefined,
        createMilestone: (input) => ({ _id: 'dev', ...input } as unknown as DevMilestone),
        updateMilestone: () => undefined,
        archiveMilestone: () => false,
        restoreMilestone: () => false,
        getMilestoneCount: () => 0,
      }
    }
  })()
  return providerPromise
}

export interface UseMilestonesResult {
  items: DevMilestone[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: MilestoneInput) => void
  update: (id: string, changes: MilestoneInput) => void
  archive: (id: string) => void
  restore: (id: string) => void
  totalCount: number
}

export function useMilestones(): UseMilestonesResult {
  const [items, setItems] = useState<DevMilestone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => {
        if (active) {
          setItems(p.getMilestones())
          setTotalCount(p.getMilestoneCount())
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
    (input: MilestoneInput) => {
      getProvider().then((svc) => {
        svc.createMilestone(input)
        refresh()
      })
    },
    [refresh],
  )

  const update = useCallback(
    (id: string, changes: MilestoneInput) => {
      getProvider().then((svc) => {
        svc.updateMilestone(id, changes)
        refresh()
      })
    },
    [refresh],
  )

  const archive = useCallback(
    (id: string) => {
      getProvider().then((svc) => {
        svc.archiveMilestone(id)
        refresh()
      })
    },
    [refresh],
  )

  const restore = useCallback(
    (id: string) => {
      getProvider().then((svc) => {
        svc.restoreMilestone(id)
        refresh()
      })
    },
    [refresh],
  )

  return { items, loading, error, refresh, create, update, archive, restore, totalCount }
}
