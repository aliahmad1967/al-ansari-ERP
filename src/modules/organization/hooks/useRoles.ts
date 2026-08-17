import { useCallback, useEffect, useState } from 'react'

import type { Role, RoleInput } from '@/core/models/SystemRoleCode'
import { devOrganizationService } from '@/core/services/DevOrganizationService'

interface RoleProvider {
  getAll(): Role[]
  create(input: unknown): void
  update(id: string, changes: unknown): void
  archive(id: string): boolean
  restore(id: string): boolean
}

let providerPromise: Promise<RoleProvider> | null = null

function getProvider(): Promise<RoleProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/organization/services/RoleService')
      const svc = new mod.RoleService()
      return {
        getAll: () => svc.findAll().map((r) => r as unknown as Role),
        create: (input) => { svc.create(input as never) },
        update: (id, changes) => { svc.update(id, changes as never) },
        archive: (id) => svc.archive(id),
        restore: (id) => svc.restore(id),
      }
    } catch {
      return {
        getAll: () => devOrganizationService.getRoles().map((r) => r as unknown as Role),
        create: (input) => { devOrganizationService.createRole(input as Record<string, unknown>) },
        update: (id, changes) => { devOrganizationService.updateRole(id, changes as Record<string, unknown>) },
        archive: (id) => devOrganizationService.archiveRole(id),
        restore: (id) => devOrganizationService.restoreRole(id),
      }
    }
  })()
  return providerPromise
}

export interface UseRolesResult {
  items: Role[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: RoleInput) => void
  update: (id: string, changes: Partial<RoleInput>) => void
  archive: (id: string) => void
  restore: (id: string) => void
}

export function useRoles(): UseRolesResult {
  const [items, setItems] = useState<Role[]>([])
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

  const create = useCallback((input: RoleInput) => {
    getProvider().then((svc) => { svc.create(input); refresh() })
  }, [refresh])

  const update = useCallback((id: string, changes: Partial<RoleInput>) => {
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
