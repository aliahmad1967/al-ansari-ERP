import { useCallback, useEffect, useState } from 'react'

import type { Permission } from '@/core/models/PermissionStatus'
import { devOrganizationService } from '@/core/services/DevOrganizationService'

interface PermProvider {
  getAll(): Permission[]
}

let providerPromise: Promise<PermProvider> | null = null

function getProvider(): Promise<PermProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/organization/services/PermissionService')
      const svc = new mod.PermissionService()
      return { getAll: () => svc.findAll().map((r) => r as unknown as Permission) }
    } catch {
      return { getAll: () => devOrganizationService.getPermissions().map((r) => r as unknown as Permission) }
    }
  })()
  return providerPromise
}

export interface UsePermissionListResult {
  items: Permission[]
  loading: boolean
  error: string | null
  refresh: () => void
}

export function usePermissionList(): UsePermissionListResult {
  const [items, setItems] = useState<Permission[]>([])
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

  return { items, loading, error, refresh }
}

export type { Permission }
