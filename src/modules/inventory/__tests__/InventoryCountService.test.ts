import { describe, it, expect, vi, beforeEach } from 'vitest'
import { InventoryCountService } from '@/modules/inventory/services/InventoryCountService'

const mockCount = {
  _id: 'ic-001',
  code: 'CNT-000001',
  warehouseId: 'wh-001',
  status: 'draft',
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
  deletedAt: null,
}

vi.mock('@/core/repositories/InventoryCountRepository', () => ({
  InventoryCountRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockImplementation(function (id: string) {
        if (id === 'nonexistent') return null
        return { ...mockCount }
      }),
      findByStatus: vi.fn().mockReturnValue([]),
      findByWarehouse: vi.fn().mockReturnValue([]),
      findLatestByWarehouse: vi.fn().mockReturnValue(null),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return { ...mockCount, ...input, _id: 'ic-001' }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return { ...mockCount, ...changes, _id: id }
      }),
      softDelete: vi.fn().mockReturnValue(true),
    }
  }),
}))

vi.mock('@/core/repositories/AuditRepository', () => ({
  AuditRepository: vi.fn().mockImplementation(function () {
    return { create: vi.fn() }
  }),
}))

describe('InventoryCountService', () => {
  let service: InventoryCountService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new InventoryCountService()
  })

  describe('findAllCounts', () => {
    it('returns all counts', () => {
      expect(service.findAllCounts()).toEqual([])
    })
  })

  describe('findCountById', () => {
    it('finds count by id', () => {
      expect(service.findCountById('ic-001')).toBeDefined()
    })

    it('returns null for nonexistent', () => {
      expect(service.findCountById('nonexistent')).toBeNull()
    })
  })

  describe('findCountsByStatus', () => {
    it('returns counts by status', () => {
      expect(service.findCountsByStatus('draft')).toEqual([])
    })
  })

  describe('findCountsByWarehouse', () => {
    it('returns counts by warehouse', () => {
      expect(service.findCountsByWarehouse('wh-001')).toEqual([])
    })
  })

  describe('createCount', () => {
    it('creates an inventory count', () => {
      const result = service.createCount({ warehouseId: 'wh-001' } as never, 'user-1', 'admin')
      expect(result._id).toBe('ic-001')
    })
  })

  describe('updateCount', () => {
    it('updates an inventory count', () => {
      const result = service.updateCount('ic-001', { notes: 'Updated' }, 'user-1', 'admin')
      expect(result.notes).toBe('Updated')
    })
  })

  describe('updateCountStatus', () => {
    it('updates count status', () => {
      const result = service.updateCountStatus('ic-001', 'completed', 'user-1', 'admin')
      expect(result.status).toBe('completed')
    })
  })

  describe('archiveCount', () => {
    it('archives a count', () => {
      expect(service.archiveCount('ic-001', 'user-1', 'admin')).toBe(true)
    })
  })
})
