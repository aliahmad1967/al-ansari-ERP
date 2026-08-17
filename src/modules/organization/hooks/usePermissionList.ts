import { useCallback, useState } from 'react'

import type { Permission, PermissionInput } from '@/core/models/Permission'
import type { FindOptions } from '@/core/repositories/BaseRepository'
import { PermissionService } from '@/modules/organization/services/PermissionService'

const service = new PermissionService()

export interface UsePermissionListResult {
  items: Permission[]
  loading: boolean
  error: string | null
  refresh: () => void
  findById: (id: string) => Permission | null
  count: () => number
}

export function usePermissionList(options?: FindOptions): UsePermissionListResult {
  const [items, setItems] = useState<Permission[]>(() => service.findAll(options))
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

  const findById = useCallback((id: string) => service.findById(id), [])

  const count = useCallback(() => service.count(), [])

  return { items, loading, error, refresh, findById, count }
}

export type { Permission, PermissionInput }
