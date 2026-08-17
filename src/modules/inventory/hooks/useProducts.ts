import { useCallback, useEffect, useState } from 'react'

interface DevProduct {
  _id: string
  sku: string
  barcode: string | null
  name: string
  nameAr: string | null
  description: string | null
  descriptionAr: string | null
  categoryId: string
  unitId: string
  purchasePrice: number
  sellingPrice: number
  minimumStock: number
  maximumStock: number
  weight: number | null
  weightUnit: string | null
  status: string
  isActive: boolean
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

type ProductInput = Record<string, unknown>

interface ProductProvider {
  getAll(): DevProduct[]
  getById(id: string): DevProduct | undefined
  create(input: ProductInput): DevProduct
  update(id: string, changes: ProductInput): DevProduct | undefined
  archive(id: string): boolean
  restore(id: string): boolean
  search(query: string): DevProduct[]
}

let providerPromise: Promise<ProductProvider> | null = null

function getProvider(): Promise<ProductProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/inventory/services/ProductService')
      const svc = new mod.ProductService()
      return {
        getAll: () => svc.findAllProducts().map(r => r as unknown as DevProduct),
        getById: (id) => svc.findProductById(id) as unknown as DevProduct | null ?? undefined,
        create: (input) => svc.createProduct(input as never) as unknown as DevProduct,
        update: (id, changes) => svc.updateProduct(id, changes as never) as unknown as DevProduct,
        archive: (id) => svc.archiveProduct(id),
        restore: (id) => svc.restoreProduct(id),
        search: (query) => svc.searchProducts(query).map(r => r as unknown as DevProduct),
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): ProductProvider {
  const KEY = 'erp_dev_products'
  const load = (): DevProduct[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  }
  const save = (data: DevProduct[]) => localStorage.setItem(KEY, JSON.stringify(data))
  const genId = () => Math.random().toString(36).substring(2, 15)
  const now = () => new Date().toISOString()
  return {
    getAll: () => load().filter(p => !p.isDeleted),
    getById: (id) => load().find(p => p._id === id && !p.isDeleted),
    create: (input) => {
      const data = load()
      const p: DevProduct = {
        _id: genId(),
        sku: (input.sku as string) || '',
        barcode: (input.barcode as string) || null,
        name: (input.name as string) || '',
        nameAr: (input.nameAr as string) || null,
        description: (input.description as string) || null,
        descriptionAr: (input.descriptionAr as string) || null,
        categoryId: (input.categoryId as string) || '',
        unitId: (input.unitId as string) || '',
        purchasePrice: (input.purchasePrice as number) || 0,
        sellingPrice: (input.sellingPrice as number) || 0,
        minimumStock: (input.minimumStock as number) || 0,
        maximumStock: (input.maximumStock as number) || 0,
        weight: (input.weight as number) || null,
        weightUnit: (input.weightUnit as string) || null,
        status: (input.status as string) || 'active',
        isActive: true,
        isDeleted: false,
        deletedAt: null,
        createdAt: now(),
        updatedAt: now(),
      }
      data.push(p); save(data); return p
    },
    update: (id, changes) => {
      const data = load(); const idx = data.findIndex(p => p._id === id)
      if (idx === -1) return undefined
      data[idx] = { ...data[idx], ...changes, updatedAt: now() } as DevProduct
      save(data); return data[idx]
    },
    archive: (id) => {
      const data = load(); const p = data.find(x => x._id === id)
      if (!p) return false; p.isDeleted = true; p.deletedAt = now(); save(data); return true
    },
    restore: (id) => {
      const data = load(); const p = data.find(x => x._id === id)
      if (!p) return false; p.isDeleted = false; p.deletedAt = null; save(data); return true
    },
    search: (query) => {
      const q = query.toLowerCase()
      return load().filter(p => !p.isDeleted && (
        p.name.toLowerCase().includes(q) ||
        (p.nameAr && p.nameAr.includes(query)) ||
        p.sku.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.includes(query))
      ))
    },
  }
}

export interface UseProductsResult {
  products: DevProduct[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: ProductInput) => void
  update: (id: string, changes: ProductInput) => void
  archive: (id: string) => void
  restore: (id: string) => void
  search: (query: string) => void
}

export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<DevProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => { if (active) { setProducts(p.getAll()); setError(null) } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const create = useCallback((input: ProductInput) => {
    getProvider().then((svc) => { svc.create(input); refresh() })
  }, [refresh])
  const update = useCallback((id: string, changes: ProductInput) => {
    getProvider().then((svc) => { svc.update(id, changes); refresh() })
  }, [refresh])
  const archive = useCallback((id: string) => {
    getProvider().then((svc) => { svc.archive(id); refresh() })
  }, [refresh])
  const restore = useCallback((id: string) => {
    getProvider().then((svc) => { svc.restore(id); refresh() })
  }, [refresh])
  const search = useCallback((query: string) => {
    getProvider().then((svc) => { setProducts(svc.search(query)) })
  }, [])

  return { products, loading, error, refresh, create, update, archive, restore, search }
}
