import { useCallback, useState } from 'react'

import type { Position, PositionInput, PositionStatusValue } from '@/core/models/Position'
import type { FindOptions } from '@/core/repositories/BaseRepository'
import { PositionService } from '@/modules/organization/services/PositionService'

const service = new PositionService()

export interface UsePositionsResult {
  items: Position[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: PositionInput) => Position
  update: (id: string, changes: Partial<PositionInput>) => Position
  archive: (id: string) => boolean
  restore: (id: string) => boolean
  updateStatus: (id: string, status: PositionStatusValue) => Position
  findById: (id: string) => Position | null
  count: () => number
}

export function usePositions(options?: FindOptions): UsePositionsResult {
  const [items, setItems] = useState<Position[]>(() => service.findAll(options))
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

  const create = useCallback((input: PositionInput) => {
    const result = service.create(input)
    refresh()
    return result
  }, [refresh])

  const update = useCallback((id: string, changes: Partial<PositionInput>) => {
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

  const updateStatus = useCallback((id: string, status: PositionStatusValue) => {
    const result = service.updateStatus(id, status)
    refresh()
    return result
  }, [refresh])

  const findById = useCallback((id: string) => service.findById(id), [])

  const count = useCallback(() => service.count(), [])

  return { items, loading, error, refresh, create, update, archive, restore, updateStatus, findById, count }
}
