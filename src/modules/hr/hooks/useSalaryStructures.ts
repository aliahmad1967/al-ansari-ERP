import { useCallback, useEffect, useState } from 'react'

interface DevSalaryStructure {
  _id: string
  code: string
  name: string
  nameAr: string | null
  description: string | null
  descriptionAr: string | null
  isDefault: boolean
  isActive: boolean
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

type StructureInput = Record<string, unknown>

interface StructureProvider {
  getAll(): DevSalaryStructure[]
  getById(id: string): DevSalaryStructure | undefined
  create(input: StructureInput): DevSalaryStructure
  update(id: string, changes: StructureInput): DevSalaryStructure | undefined
  archive(id: string): boolean
  restore(id: string): boolean
}

let providerPromise: Promise<StructureProvider> | null = null

function getProvider(): Promise<StructureProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/hr/services/SalaryStructureService')
      const svc = new mod.SalaryStructureService()
      return {
        getAll: () => svc.findAllStructures().map(r => r as unknown as DevSalaryStructure),
        getById: (id) => svc.findStructureById(id) as unknown as DevSalaryStructure | null ?? undefined,
        create: (input) => svc.createStructure(input as never) as unknown as DevSalaryStructure,
        update: (id, changes) => svc.updateStructure(id, changes as never) as unknown as DevSalaryStructure,
        archive: (id) => svc.archiveStructure(id),
        restore: (id) => svc.restoreStructure(id),
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): StructureProvider {
  const KEY = 'erp_dev_salary_structures'
  const load = (): DevSalaryStructure[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  }
  const save = (data: DevSalaryStructure[]) => localStorage.setItem(KEY, JSON.stringify(data))
  const genId = () => Math.random().toString(36).substring(2, 15)
  const now = () => new Date().toISOString()
  return {
    getAll: () => load().filter(s => !s.isDeleted),
    getById: (id) => load().find(s => s._id === id && !s.isDeleted),
    create: (input) => {
      const data = load()
      const s: DevSalaryStructure = {
        _id: genId(), code: (input.code as string) || '', name: (input.name as string) || '',
        nameAr: (input.nameAr as string) || null, description: (input.description as string) || null,
        descriptionAr: (input.descriptionAr as string) || null, isDefault: false, isActive: true,
        isDeleted: false, deletedAt: null, createdAt: now(), updatedAt: now(),
      }
      data.push(s); save(data); return s
    },
    update: (id, changes) => {
      const data = load(); const idx = data.findIndex(s => s._id === id)
      if (idx === -1) return undefined
      data[idx] = { ...data[idx], ...changes, updatedAt: now() } as DevSalaryStructure
      save(data); return data[idx]
    },
    archive: (id) => {
      const data = load(); const s = data.find(x => x._id === id)
      if (!s) return false; s.isDeleted = true; s.deletedAt = now(); save(data); return true
    },
    restore: (id) => {
      const data = load(); const s = data.find(x => x._id === id)
      if (!s) return false; s.isDeleted = false; s.deletedAt = null; save(data); return true
    },
  }
}

export interface UseSalaryStructuresResult {
  items: DevSalaryStructure[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: StructureInput) => void
  update: (id: string, changes: StructureInput) => void
  archive: (id: string) => void
  restore: (id: string) => void
}

export function useSalaryStructures(): UseSalaryStructuresResult {
  const [items, setItems] = useState<DevSalaryStructure[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => { if (active) { setItems(p.getAll()); setError(null) } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const create = useCallback((input: StructureInput) => {
    getProvider().then((svc) => { svc.create(input); refresh() })
  }, [refresh])
  const update = useCallback((id: string, changes: StructureInput) => {
    getProvider().then((svc) => { svc.update(id, changes); refresh() })
  }, [refresh])
  const archive = useCallback((id: string) => {
    getProvider().then((svc) => { svc.archive(id); refresh() })
  }, [refresh])
  const restore = useCallback((id: string) => {
    getProvider().then((svc) => { svc.restore(id); refresh() })
  }, [refresh])

  return { items, loading, error, refresh, create, update, archive, restore }
}
