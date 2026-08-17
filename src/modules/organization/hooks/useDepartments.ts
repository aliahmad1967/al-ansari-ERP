import { useCallback, useEffect, useState } from 'react'

import type { Department, DepartmentInput } from '@/core/models/DepartmentStatus'
import { devOrganizationService } from '@/core/services/DevOrganizationService'

interface DeptProvider {
  getAll(): Department[]
  create(input: unknown): void
  update(id: string, changes: unknown): void
  archive(id: string): boolean
  restore(id: string): boolean
}

let providerPromise: Promise<DeptProvider> | null = null

function getProvider(): Promise<DeptProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/organization/services/DepartmentService')
      const svc = new mod.DepartmentService()
      return {
        getAll: () => svc.findAll().map((r) => r as unknown as Department),
        create: (input) => { svc.create(input as never) },
        update: (id, changes) => { svc.update(id, changes as never) },
        archive: (id) => svc.archive(id),
        restore: (id) => svc.restore(id),
      }
    } catch {
      return {
        getAll: () => devOrganizationService.getDepartments().map((r) => r as unknown as Department),
        create: (input) => { devOrganizationService.createDepartment(input as Record<string, unknown>) },
        update: (id, changes) => { devOrganizationService.updateDepartment(id, changes as Record<string, unknown>) },
        archive: (id) => devOrganizationService.archiveDepartment(id),
        restore: (id) => devOrganizationService.restoreDepartment(id),
      }
    }
  })()
  return providerPromise
}

export interface UseDepartmentsResult {
  items: Department[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: DepartmentInput) => void
  update: (id: string, changes: Partial<DepartmentInput>) => void
  archive: (id: string) => void
  restore: (id: string) => void
}

export function useDepartments(): UseDepartmentsResult {
  const [items, setItems] = useState<Department[]>([])
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

  const create = useCallback((input: DepartmentInput) => {
    getProvider().then((svc) => { svc.create(input); refresh() })
  }, [refresh])

  const update = useCallback((id: string, changes: Partial<DepartmentInput>) => {
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
