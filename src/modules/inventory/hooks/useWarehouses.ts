import { useCallback, useEffect, useState } from 'react'

interface DevWarehouse {
  _id: string
  code: string
  name: string
  nameAr: string | null
  address: string | null
  addressAr: string | null
  managerUserId: string | null
  capacity: number
  capacityUnit: string | null
  status: string
  isActive: boolean
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

type WarehouseInput = Record<string, unknown>

interface WarehouseProvider {
  getAll(): DevWarehouse[]
  getById(id: string): DevWarehouse | undefined
  create(input: WarehouseInput): DevWarehouse
  update(id: string, changes: WarehouseInput): DevWarehouse | undefined
  archive(id: string): boolean
  restore(id: string): boolean
  getLocations(warehouseId: string): DevLocation[]
  createLocation(input: LocationInput): DevLocation
  archiveLocation(id: string): boolean
}

interface DevLocation {
  _id: string
  warehouseId: string
  code: string
  name: string
  nameAr: string | null
  aisle: string | null
  rack: string | null
  shelf: string | null
  bin: string | null
  capacity: number
  isActive: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

type LocationInput = Record<string, unknown>

let providerPromise: Promise<WarehouseProvider> | null = null

function getProvider(): Promise<WarehouseProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/inventory/services/WarehouseService')
      const svc = new mod.WarehouseService()
      return {
        getAll: () => svc.findAllWarehouses().map(r => r as unknown as DevWarehouse),
        getById: (id) => svc.findWarehouseById(id) as unknown as DevWarehouse | null ?? undefined,
        create: (input) => svc.createWarehouse(input as never) as unknown as DevWarehouse,
        update: (id, changes) => svc.updateWarehouse(id, changes as never) as unknown as DevWarehouse,
        archive: (id) => svc.archiveWarehouse(id),
        restore: (id) => svc.restoreWarehouse(id),
        getLocations: (warehouseId) => svc.findAllLocations(warehouseId).map(r => r as unknown as DevLocation),
        createLocation: (input) => svc.createLocation(input as never) as unknown as DevLocation,
        archiveLocation: (id) => svc.archiveLocation(id),
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): WarehouseProvider {
  const KEY_WAREHOUSES = 'erp_dev_warehouses'
  const KEY_LOCATIONS = 'erp_dev_warehouse_locations'
  const loadWarehouses = (): DevWarehouse[] => {
    try { return JSON.parse(localStorage.getItem(KEY_WAREHOUSES) ?? '[]') } catch { return [] }
  }
  const saveWarehouses = (data: DevWarehouse[]) => localStorage.setItem(KEY_WAREHOUSES, JSON.stringify(data))
  const loadLocations = (): DevLocation[] => {
    try { return JSON.parse(localStorage.getItem(KEY_LOCATIONS) ?? '[]') } catch { return [] }
  }
  const saveLocations = (data: DevLocation[]) => localStorage.setItem(KEY_LOCATIONS, JSON.stringify(data))
  const genId = () => Math.random().toString(36).substring(2, 15)
  const now = () => new Date().toISOString()
  return {
    getAll: () => loadWarehouses().filter(w => !w.isDeleted),
    getById: (id) => loadWarehouses().find(w => w._id === id && !w.isDeleted),
    create: (input) => {
      const data = loadWarehouses()
      const w: DevWarehouse = {
        _id: genId(),
        code: (input.code as string) || '',
        name: (input.name as string) || '',
        nameAr: (input.nameAr as string) || null,
        address: (input.address as string) || null,
        addressAr: (input.addressAr as string) || null,
        managerUserId: (input.managerUserId as string) || null,
        capacity: (input.capacity as number) || 0,
        capacityUnit: (input.capacityUnit as string) || null,
        status: (input.status as string) || 'active',
        isActive: true,
        isDeleted: false,
        deletedAt: null,
        createdAt: now(),
        updatedAt: now(),
      }
      data.push(w); saveWarehouses(data); return w
    },
    update: (id, changes) => {
      const data = loadWarehouses(); const idx = data.findIndex(w => w._id === id)
      if (idx === -1) return undefined
      data[idx] = { ...data[idx], ...changes, updatedAt: now() } as DevWarehouse
      saveWarehouses(data); return data[idx]
    },
    archive: (id) => {
      const data = loadWarehouses(); const w = data.find(x => x._id === id)
      if (!w) return false; w.isDeleted = true; w.deletedAt = now(); saveWarehouses(data); return true
    },
    restore: (id) => {
      const data = loadWarehouses(); const w = data.find(x => x._id === id)
      if (!w) return false; w.isDeleted = false; w.deletedAt = null; saveWarehouses(data); return true
    },
    getLocations: (warehouseId) => loadLocations().filter(l => l.warehouseId === warehouseId && !l.isDeleted),
    createLocation: (input) => {
      const data = loadLocations()
      const l: DevLocation = {
        _id: genId(),
        warehouseId: (input.warehouseId as string) || '',
        code: (input.code as string) || '',
        name: (input.name as string) || '',
        nameAr: (input.nameAr as string) || null,
        aisle: (input.aisle as string) || null,
        rack: (input.rack as string) || null,
        shelf: (input.shelf as string) || null,
        bin: (input.bin as string) || null,
        capacity: (input.capacity as number) || 0,
        isActive: true,
        isDeleted: false,
        createdAt: now(),
        updatedAt: now(),
      }
      data.push(l); saveLocations(data); return l
    },
    archiveLocation: (id) => {
      const data = loadLocations(); const l = data.find(x => x._id === id)
      if (!l) return false; l.isDeleted = true; saveLocations(data); return true
    },
  }
}

export interface UseWarehousesResult {
  warehouses: DevWarehouse[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: WarehouseInput) => void
  update: (id: string, changes: WarehouseInput) => void
  archive: (id: string) => void
  restore: (id: string) => void
  getLocations: (warehouseId: string) => void
  createLocation: (input: LocationInput) => void
  archiveLocation: (id: string) => void
}

export function useWarehouses(): UseWarehousesResult {
  const [warehouses, setWarehouses] = useState<DevWarehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => { if (active) { setWarehouses(p.getAll()); setError(null) } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const create = useCallback((input: WarehouseInput) => {
    getProvider().then((svc) => { svc.create(input); refresh() })
  }, [refresh])
  const update = useCallback((id: string, changes: WarehouseInput) => {
    getProvider().then((svc) => { svc.update(id, changes); refresh() })
  }, [refresh])
  const archive = useCallback((id: string) => {
    getProvider().then((svc) => { svc.archive(id); refresh() })
  }, [refresh])
  const restore = useCallback((id: string) => {
    getProvider().then((svc) => { svc.restore(id); refresh() })
  }, [refresh])
  const getLocations = useCallback((warehouseId: string) => {
    getProvider().then((svc) => { svc.getLocations(warehouseId) })
  }, [])
  const createLocation = useCallback((input: LocationInput) => {
    getProvider().then((svc) => { svc.createLocation(input); refresh() })
  }, [refresh])
  const archiveLocation = useCallback((id: string) => {
    getProvider().then((svc) => { svc.archiveLocation(id); refresh() })
  }, [refresh])

  return { warehouses, loading, error, refresh, create, update, archive, restore, getLocations, createLocation, archiveLocation }
}
