import { useCallback, useEffect, useMemo, useState } from 'react'
import type { DashboardData } from '../types/dashboard.types'
import { useAuth } from '@/hooks/useAuth'

export function useDashboardData() {
  const { session } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const permissions = useMemo(() => session?.permissionCodes ?? [], [session?.permissionCodes])

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      try {
        const service = await import('../services/DevDashboardService')
          .then((mod) => mod)
          .catch(() => import('../services/DashboardService'))

        const result = await service.getDashboardData(permissions)
        if (!cancelled) {
          setData(result)
          setIsLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load dashboard data:', err)
          setError(err instanceof Error ? err.message : 'Failed to load dashboard')
          setIsLoading(false)
        }
      }
    }

    void loadData()
    return () => {
      cancelled = true
    }
  }, [permissions])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      setError(null)
      const service = await import('../services/DevDashboardService')
        .then((mod) => mod)
        .catch(() => import('../services/DashboardService'))

      const result = await service.getDashboardData(permissions)
      setData(result)
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }, [permissions])

  return { data, isLoading, error, refresh }
}
