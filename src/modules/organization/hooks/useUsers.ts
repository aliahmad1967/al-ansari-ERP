import { useCallback, useState } from 'react'

import type { User, UserInput, UserStatusValue } from '@/core/models/User'
import type { FindOptions } from '@/core/repositories/BaseRepository'
import { UserService } from '@/modules/organization/services/UserService'

const service = new UserService()

export interface UseUsersResult {
  items: User[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: UserInput & { password?: string }) => User
  update: (id: string, changes: Partial<UserInput>) => User
  archive: (id: string) => boolean
  restore: (id: string) => boolean
  updateStatus: (id: string, status: UserStatusValue) => User
  findById: (id: string) => User | null
  count: () => number
}

export function useUsers(options?: FindOptions): UseUsersResult {
  const [items, setItems] = useState<User[]>(() => service.findAll(options))
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

  const create = useCallback((input: UserInput & { password?: string }) => {
    const result = service.create(input)
    refresh()
    return result
  }, [refresh])

  const update = useCallback((id: string, changes: Partial<UserInput>) => {
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

  const updateStatus = useCallback((id: string, status: UserStatusValue) => {
    const result = service.updateStatus(id, status)
    refresh()
    return result
  }, [refresh])

  const findById = useCallback((id: string) => service.findById(id), [])

  const count = useCallback(() => service.count(), [])

  return { items, loading, error, refresh, create, update, archive, restore, updateStatus, findById, count }
}
