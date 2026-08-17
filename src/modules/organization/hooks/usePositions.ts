import { useCallback, useEffect, useState } from 'react'

import type { Position, PositionInput } from '@/core/models/PositionStatus'
import { devOrganizationService } from '@/core/services/DevOrganizationService'

interface PosProvider {
  getAll(): Position[]
  create(input: unknown): void
  update(id: string, changes: unknown): void
  archive(id: string): boolean
  restore(id: string): boolean
}

let providerPromise: Promise<PosProvider> | null = null

function getProvider(): Promise<PosProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/organization/services/PositionService')
      const svc = new mod.PositionService()
      return {
        getAll: () => svc.findAll().map((r) => r as unknown as Position),
        create: (input) => { svc.create(input as never) },
        update: (id, changes) => { svc.update(id, changes as never) },
        archive: (id) => svc.archive(id),
        restore: (id) => svc.restore(id),
      }
    } catch {
      return {
        getAll: () => devOrganizationService.getPositions().map((r) => r as unknown as Position),
        create: (input) => { devOrganizationService.createPosition(input as Record<string, unknown>) },
        update: (id, changes) => { devOrganizationService.updatePosition(id, changes as Record<string, unknown>) },
        archive: (id) => devOrganizationService.archivePosition(id),
        restore: (id) => devOrganizationService.restorePosition(id),
      }
    }
  })()
  return providerPromise
}

export interface UsePositionsResult {
  items: Position[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: PositionInput) => void
  update: (id: string, changes: Partial<PositionInput>) => void
  archive: (id: string) => void
  restore: (id: string) => void
}

export function usePositions(): UsePositionsResult {
  const [items, setItems] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => { if (active) { setItems(p.getAll()); setError(null) } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  const create = useCallback((input: PositionInput) => {
    getProvider().then((svc) => { svc.create(input); refresh() })
  }, [refresh])

  const update = useCallback((id: string, changes: Partial<PositionInput>) => {
    getProvider().then((svc) => { svc.update(id, changes); refresh() })
  }, [refresh])

  const archive = useCallback((id: string) => {
    getProvider().then((svc) => { svc.archive(id); refresh() })
  }, [refresh])

  const restore = useCallback((id: string) => {
    getProvider().then((svc) => { svc.restore(id); refresh() })
  }, [refresh])

  return { items, loading, error, refresh, create, update, archive, restore }
}
