import { useCallback, useState } from 'react'

import type { Branch, BranchInput, BranchStatusValue } from '@/core/models/Branch'
import type { FindOptions } from '@/core/repositories/BaseRepository'
import { BranchService } from '@/modules/organization/services/BranchService'

const service = new BranchService()

export interface UseBranchesResult {
  items: Branch[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: BranchInput) => Branch
  update: (id: string, changes: Partial<BranchInput>) => Branch
  archive: (id: string) => boolean
  restore: (id: string) => boolean
  updateStatus: (id: string, status: BranchStatusValue) => Branch
  findById: (id: string) => Branch | null
  count: () => number
}

export function useBranches(options?: FindOptions): UseBranchesResult {
  const [items, setItems] = useState<Branch[]>(() => service.findAll(options))
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

  const create = useCallback((input: BranchInput) => {
    const result = service.create(input)
    refresh()
    return result
  }, [refresh])

  const update = useCallback((id: string, changes: Partial<BranchInput>) => {
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

  const updateStatus = useCallback((id: string, status: BranchStatusValue) => {
    const result = service.updateStatus(id, status)
    refresh()
    return result
  }, [refresh])

  const findById = useCallback((id: string) => service.findById(id), [])

  const count = useCallback(() => service.count(), [])

  return { items, loading, error, refresh, create, update, archive, restore, updateStatus, findById, count }
}
