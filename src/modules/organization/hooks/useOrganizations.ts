import { useCallback, useState } from 'react'

import type { Organization, OrganizationInput, OrganizationStatusValue } from '@/core/models/Organization'
import type { FindOptions } from '@/core/repositories/BaseRepository'
import { OrganizationService } from '@/modules/organization/services/OrganizationService'

const service = new OrganizationService()

export interface UseOrganizationsResult {
  items: Organization[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: OrganizationInput) => Organization
  update: (id: string, changes: Partial<OrganizationInput>) => Organization
  archive: (id: string) => boolean
  restore: (id: string) => boolean
  updateStatus: (id: string, status: OrganizationStatusValue) => Organization
  findById: (id: string) => Organization | null
  count: () => number
}

export function useOrganizations(options?: FindOptions): UseOrganizationsResult {
  const [items, setItems] = useState<Organization[]>(() => service.findAll(options))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(() => {
    setLoading(true)
    try {
      setItems(service.findAll(options))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [options])

  const create = useCallback((input: OrganizationInput) => {
    const result = service.create(input)
    refresh()
    return result
  }, [refresh])

  const update = useCallback((id: string, changes: Partial<OrganizationInput>) => {
    const result = service.update(id, changes)
    refresh()
    return result
  }, [refresh])

  const archive = useCallback((id: string) => {
    const result = service.archive(id)
    refresh()
    return result
  }, [refresh])

  const restore = useCallback((id: string) => {
    const result = service.restore(id)
    refresh()
    return result
  }, [refresh])

  const updateStatus = useCallback((id: string, status: OrganizationStatusValue) => {
    const result = service.updateStatus(id, status)
    refresh()
    return result
  }, [refresh])

  const findById = useCallback((id: string) => service.findById(id), [])

  const count = useCallback(() => service.count(), [])

  return { items, loading, error, refresh, create, update, archive, restore, updateStatus, findById, count }
}
