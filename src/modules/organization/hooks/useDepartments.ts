import { useCallback, useState } from 'react'

import type { Department, DepartmentInput, DepartmentStatusValue } from '@/core/models/Department'
import type { FindOptions } from '@/core/repositories/BaseRepository'
import { DepartmentService } from '@/modules/organization/services/DepartmentService'

const service = new DepartmentService()

export interface UseDepartmentsResult {
  items: Department[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: DepartmentInput) => Department
  update: (id: string, changes: Partial<DepartmentInput>) => Department
  archive: (id: string) => boolean
  restore: (id: string) => boolean
  updateStatus: (id: string, status: DepartmentStatusValue) => Department
  findById: (id: string) => Department | null
  count: () => number
}

export function useDepartments(options?: FindOptions): UseDepartmentsResult {
  const [items, setItems] = useState<Department[]>(() => service.findAll(options))
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

  const create = useCallback((input: DepartmentInput) => {
    const result = service.create(input)
    refresh()
    return result
  }, [refresh])

  const update = useCallback((id: string, changes: Partial<DepartmentInput>) => {
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

  const updateStatus = useCallback((id: string, status: DepartmentStatusValue) => {
    const result = service.updateStatus(id, status)
    refresh()
    return result
  }, [refresh])

  const findById = useCallback((id: string) => service.findById(id), [])

  const count = useCallback(() => service.count(), [])

  return { items, loading, error, refresh, create, update, archive, restore, updateStatus, findById, count }
}
