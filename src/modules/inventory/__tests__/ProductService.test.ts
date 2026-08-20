import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProductService } from '@/modules/inventory/services/ProductService'

const mockProduct = {
  _id: 'prod-001',
  name: 'Widget',
  sku: 'WDG-001',
  barcode: '123456789',
  categoryId: 'cat-001',
  minimumStock: 10,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
  deletedAt: null,
}

vi.mock('@/core/repositories/ProductRepository', () => ({
  ProductRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockImplementation(function (id: string) {
        if (id === 'nonexistent') return null
        return { ...mockProduct }
      }),
      findBySku: vi.fn().mockImplementation(function (sku: string) {
        if (sku === 'WDG-001') return { ...mockProduct }
        return null
      }),
      findByBarcode: vi.fn().mockImplementation(function (barcode: string) {
        if (barcode === '123456789') return { ...mockProduct }
        return null
      }),
      findByCategory: vi.fn().mockReturnValue([]),
      search: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return { ...mockProduct, ...input, _id: 'prod-001' }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return { ...mockProduct, ...changes, _id: id }
      }),
      softDelete: vi.fn().mockReturnValue(true),
      restore: vi.fn().mockReturnValue(true),
    }
  }),
}))

vi.mock('@/core/repositories/AuditRepository', () => ({
  AuditRepository: vi.fn().mockImplementation(function () {
    return { create: vi.fn() }
  }),
}))

describe('ProductService', () => {
  let service: ProductService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new ProductService()
  })

  describe('findAllProducts', () => {
    it('returns all products', () => {
      expect(service.findAllProducts()).toEqual([])
    })
  })

  describe('findProductById', () => {
    it('finds product by id', () => {
      const result = service.findProductById('prod-001')
      expect(result).toBeDefined()
      expect(result?._id).toBe('prod-001')
    })

    it('returns null for nonexistent', () => {
      expect(service.findProductById('nonexistent')).toBeNull()
    })
  })

  describe('findBySku', () => {
    it('finds product by SKU', () => {
      const result = service.findBySku('WDG-001')
      expect(result).toBeDefined()
      expect(result?.sku).toBe('WDG-001')
    })

    it('returns null for unknown SKU', () => {
      expect(service.findBySku('UNKNOWN')).toBeNull()
    })
  })

  describe('findByBarcode', () => {
    it('finds product by barcode', () => {
      const result = service.findByBarcode('123456789')
      expect(result).toBeDefined()
    })

    it('returns null for unknown barcode', () => {
      expect(service.findByBarcode('000000000')).toBeNull()
    })
  })

  describe('createProduct', () => {
    it('creates a product', () => {
      const result = service.createProduct(
        { name: 'Widget', sku: 'WDG-001', categoryId: 'cat-001', minimumStock: 10 } as never,
        'user-1',
        'admin',
      )
      expect(result._id).toBe('prod-001')
    })
  })

  describe('updateProduct', () => {
    it('updates a product', () => {
      const result = service.updateProduct('prod-001', { name: 'Updated Widget' }, 'user-1', 'admin')
      expect(result.name).toBe('Updated Widget')
    })
  })

  describe('archiveProduct', () => {
    it('archives a product', () => {
      expect(service.archiveProduct('prod-001', 'user-1', 'admin')).toBe(true)
    })
  })

  describe('restoreProduct', () => {
    it('restores a product', () => {
      expect(service.restoreProduct('prod-001', 'user-1', 'admin')).toBe(true)
    })
  })
})
