import { useCallback, useState } from 'react'

import type { Role, RoleInput } from '@/core/models/Role'
import type { FindOptions } from '@/core/repositories/BaseRepository'
import { RoleService } from '@/modules/organization/services/RoleService'

const service = new RoleService()

export interface UseRolesResult {
  items: Role[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: RoleInput) => Role
  update: (id: string, changes: Partial<RoleInput>) => Role
  archive: (id: string) => boolean
  restore: (id: string) => boolean
  findById: (id: string) => Role | null
  count: () => number
}

export function useRoles(options?: FindOptions): UseRolesResult {
  const [items, setItems] = useState<Role[]>(() => service.findAll(options))
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

  const create = useCallback((input: RoleInput) => {
    const result = service.create(input)
    refresh()
    return result
  }, [refresh])

  const update = useCallback((id: string, changes: Partial<RoleInput>) => {
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

  const findById = useCallback((id: string) => service.findById(id), [])

  const count = useCallback(() => service.count(), [])

  return { items, loading, error, refresh, create, update, archive, restore, findById, count }
}
