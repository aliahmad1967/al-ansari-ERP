import { useCallback, useEffect, useState } from 'react'

import type { Organization, OrganizationInput } from '@/core/models/OrganizationStatus'
import { devOrganizationService } from '@/core/services/DevOrganizationService'

let providerPromise: Promise<{
  getOrganizations(): unknown[]
  resolveOrganization(item: unknown): Organization
  create(input: unknown): unknown
  update(id: string, changes: unknown): unknown
  archive(id: string): boolean
  restore(id: string): boolean
}> | null = null

function getProvider() {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/organization/services/OrganizationService')
      const svc = new mod.OrganizationService()
      return {
        getOrganizations: () => svc.findAll(),
        resolveOrganization: (item: unknown) => item as Organization,
        create: (input: unknown) => svc.create(input as never),
        update: (id: string, changes: unknown) => svc.update(id, changes as never),
        archive: (id: string) => svc.archive(id),
        restore: (id: string) => svc.restore(id),
      }
    } catch {
      return {
        getOrganizations: () => devOrganizationService.getOrganizations(),
        resolveOrganization: (item: unknown) => item as Organization,
        create: (input: unknown) => devOrganizationService.createOrg(input as Record<string, unknown>),
        update: (id: string, changes: unknown) => devOrganizationService.updateOrg(id, changes as Record<string, unknown>),
        archive: (id: string) => devOrganizationService.archiveOrg(id),
        restore: (id: string) => devOrganizationService.restoreOrg(id),
      }
    }
  })()
  return providerPromise
}

export interface UseOrganizationsResult {
  items: Organization[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: OrganizationInput) => void
  update: (id: string, changes: Partial<OrganizationInput>) => void
  archive: (id: string) => void
  restore: (id: string) => void
}

export function useOrganizations(): UseOrganizationsResult {
  const [items, setItems] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => {
        if (!active) return
        const raw = p.getOrganizations()
        setItems(raw.map((r) => p.resolveOrganization(r)))
        setError(null)
      })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  const create = useCallback((input: OrganizationInput) => {
    getProvider().then((svc) => { svc.create(input); refresh() })
  }, [refresh])

  const update = useCallback((id: string, changes: Partial<OrganizationInput>) => {
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
