import { useCallback, useEffect, useState } from 'react'

import type { Branch, BranchInput } from '@/core/models/BranchStatus'
import { devOrganizationService } from '@/core/services/DevOrganizationService'

interface BranchProvider {
  getAll(): Branch[]
  create(input: unknown): void
  update(id: string, changes: unknown): void
  archive(id: string): boolean
  restore(id: string): boolean
}

let providerPromise: Promise<BranchProvider> | null = null

function getProvider(): Promise<BranchProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/organization/services/BranchService')
      const svc = new mod.BranchService()
      return {
        getAll: () => svc.findAll().map((r) => r as unknown as Branch),
        create: (input) => { svc.create(input as never) },
        update: (id, changes) => { svc.update(id, changes as never) },
        archive: (id) => svc.archive(id),
        restore: (id) => svc.restore(id),
      }
    } catch {
      return {
        getAll: () => devOrganizationService.getBranches().map((r) => r as unknown as Branch),
        create: (input) => { devOrganizationService.createBranch(input as Record<string, unknown>) },
        update: (id, changes) => { devOrganizationService.updateBranch(id, changes as Record<string, unknown>) },
        archive: (id) => devOrganizationService.archiveBranch(id),
        restore: (id) => devOrganizationService.restoreBranch(id),
      }
    }
  })()
  return providerPromise
}

export interface UseBranchesResult {
  items: Branch[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: BranchInput) => void
  update: (id: string, changes: Partial<BranchInput>) => void
  archive: (id: string) => void
  restore: (id: string) => void
}

export function useBranches(): UseBranchesResult {
  const [items, setItems] = useState<Branch[]>([])
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

  const create = useCallback((input: BranchInput) => {
    getProvider().then((svc) => { svc.create(input); refresh() })
  }, [refresh])

  const update = useCallback((id: string, changes: Partial<BranchInput>) => {
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
