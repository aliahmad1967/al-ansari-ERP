import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SupplierService } from '@/modules/procurement/services/SupplierService'

const mockSupplier = {
  _id: 'sup-001',
  name: 'Acme Supplies',
  code: 'SUP-001',
  contactEmail: 'contact@acme.com',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
  deletedAt: null,
}

vi.mock('@/core/repositories/SupplierRepository', () => ({
  SupplierRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockImplementation(function (id: string) {
        if (id === 'nonexistent') return null
        return { ...mockSupplier }
      }),
      findActive: vi.fn().mockReturnValue([{ ...mockSupplier }]),
      search: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return { ...mockSupplier, ...input, _id: 'sup-001' }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return { ...mockSupplier, ...changes, _id: id }
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

describe('SupplierService', () => {
  let service: SupplierService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new SupplierService()
  })

  describe('findAllSuppliers', () => {
    it('returns all suppliers', () => {
      expect(service.findAllSuppliers()).toEqual([])
    })
  })

  describe('findSupplierById', () => {
    it('finds supplier by id', () => {
      expect(service.findSupplierById('sup-001')).toBeDefined()
    })

    it('returns null for nonexistent', () => {
      expect(service.findSupplierById('nonexistent')).toBeNull()
    })
  })

  describe('findActiveSuppliers', () => {
    it('returns active suppliers', () => {
      expect(service.findActiveSuppliers()).toHaveLength(1)
    })
  })

  describe('searchSuppliers', () => {
    it('searches suppliers', () => {
      expect(service.searchSuppliers('Acme')).toEqual([])
    })
  })

  describe('createSupplier', () => {
    it('creates a supplier', () => {
      const result = service.createSupplier(
        { name: 'Acme Supplies', code: 'SUP-001' } as never,
        'user-1',
        'admin',
      )
      expect(result.name).toBe('Acme Supplies')
    })
  })

  describe('updateSupplier', () => {
    it('updates a supplier', () => {
      const result = service.updateSupplier('sup-001', { name: 'New Name' }, 'user-1', 'admin')
      expect(result.name).toBe('New Name')
    })
  })

  describe('archiveSupplier', () => {
    it('archives a supplier', () => {
      expect(service.archiveSupplier('sup-001', 'user-1', 'admin')).toBe(true)
    })
  })

  describe('restoreSupplier', () => {
    it('restores a supplier', () => {
      expect(service.restoreSupplier('sup-001', 'user-1', 'admin')).toBe(true)
    })
  })
})
