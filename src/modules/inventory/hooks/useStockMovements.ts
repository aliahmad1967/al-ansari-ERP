import { useCallback, useEffect, useState } from 'react'

interface DevStockMovement {
  _id: string
  type: string
  productId: string
  warehouseId: string
  locationId: string | null
  quantity: number
  unitCost: number
  totalCost: number
  referenceType: string | null
  referenceId: string | null
  referenceNumber: string | null
  batchNumber: string | null
  expiryDate: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

type MovementInput = Record<string, unknown>

interface StockMovementProvider {
  getAll(): DevStockMovement[]
  getByProduct(productId: string): DevStockMovement[]
  getByWarehouse(warehouseId: string): DevStockMovement[]
  getRecent(limit: number): DevStockMovement[]
  recordMovement(input: MovementInput): DevStockMovement
}

let providerPromise: Promise<StockMovementProvider> | null = null

function getProvider(): Promise<StockMovementProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/inventory/services/StockService')
      const svc = new mod.StockService()
      return {
        getAll: () => svc.findMovements().map((r) => r as unknown as DevStockMovement),
        getByProduct: (productId) => svc.findMovementsByProduct(productId).map(r => r as unknown as DevStockMovement),
        getByWarehouse: (warehouseId) => svc.findMovementsByWarehouse(warehouseId).map(r => r as unknown as DevStockMovement),
        getRecent: (limit) => svc.findRecentMovements(limit).map(r => r as unknown as DevStockMovement),
        recordMovement: (input) => svc.recordMovement(input as never) as unknown as DevStockMovement,
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): StockMovementProvider {
  const KEY = 'erp_dev_stock_movements'
  const load = (): DevStockMovement[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  }
  const save = (data: DevStockMovement[]) => localStorage.setItem(KEY, JSON.stringify(data))
  const genId = () => Math.random().toString(36).substring(2, 15)
  const now = () => new Date().toISOString()
  return {
    getAll: () => load(),
    getByProduct: (productId) => load().filter(m => m.productId === productId),
    getByWarehouse: (warehouseId) => load().filter(m => m.warehouseId === warehouseId),
    getRecent: (limit) => load().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit),
    recordMovement: (input) => {
      const data = load()
      const quantity = (input.quantity as number) || 0
      const unitCost = (input.unitCost as number) || 0
      const m: DevStockMovement = {
        _id: genId(),
        type: (input.type as string) || 'adjustment',
        productId: (input.productId as string) || '',
        warehouseId: (input.warehouseId as string) || '',
        locationId: (input.locationId as string) || null,
        quantity,
        unitCost,
        totalCost: quantity * unitCost,
        referenceType: (input.referenceType as string) || null,
        referenceId: (input.referenceId as string) || null,
        referenceNumber: (input.referenceNumber as string) || null,
        batchNumber: (input.batchNumber as string) || null,
        expiryDate: (input.expiryDate as string) || null,
        notes: (input.notes as string) || null,
        createdAt: now(),
        updatedAt: now(),
      }
      data.push(m); save(data); return m
    },
  }
}

export interface UseStockMovementsResult {
  movements: DevStockMovement[]
  loading: boolean
  error: string | null
  refresh: () => void
  recordMovement: (input: MovementInput) => void
}

export function useStockMovements(): UseStockMovementsResult {
  const [movements, setMovements] = useState<DevStockMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => { if (active) { setMovements(p.getAll()); setError(null) } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const recordMovement = useCallback((input: MovementInput) => {
    getProvider().then((svc) => { svc.recordMovement(input); refresh() })
  }, [refresh])

  return { movements, loading, error, refresh, recordMovement }
}
