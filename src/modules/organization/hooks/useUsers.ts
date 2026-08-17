import { useCallback, useEffect, useState } from 'react'

import type { User, UserInput } from '@/core/models/UserStatus'
import { devOrganizationService } from '@/core/services/DevOrganizationService'

interface UserProvider {
  getAll(): User[]
  create(input: unknown): void
  update(id: string, changes: unknown): void
  archive(id: string): boolean
  restore(id: string): boolean
}

let providerPromise: Promise<UserProvider> | null = null

function getProvider(): Promise<UserProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/organization/services/UserService')
      const svc = new mod.UserService()
      return {
        getAll: () => svc.findAll().map((r) => r as unknown as User),
        create: (input) => { svc.create(input as never) },
        update: (id, changes) => { svc.update(id, changes as never) },
        archive: (id) => svc.archive(id),
        restore: (id) => svc.restore(id),
      }
    } catch {
      return {
        getAll: () => devOrganizationService.getUsers().map((r) => r as unknown as User),
        create: (input) => { devOrganizationService.createUser(input as Record<string, unknown>) },
        update: (id, changes) => { devOrganizationService.updateUser(id, changes as Record<string, unknown>) },
        archive: (id) => devOrganizationService.archiveUser(id),
        restore: (id) => devOrganizationService.restoreUser(id),
      }
    }
  })()
  return providerPromise
}

export interface UseUsersResult {
  items: User[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: UserInput & { password?: string }) => void
  update: (id: string, changes: Partial<UserInput>) => void
  archive: (id: string) => void
  restore: (id: string) => void
}

export function useUsers(): UseUsersResult {
  const [items, setItems] = useState<User[]>([])
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

  const create = useCallback((input: UserInput & { password?: string }) => {
    getProvider().then((svc) => { svc.create(input); refresh() })
  }, [refresh])

  const update = useCallback((id: string, changes: Partial<UserInput>) => {
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
