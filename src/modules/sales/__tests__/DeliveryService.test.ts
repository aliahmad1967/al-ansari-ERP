import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DeliveryService } from '@/modules/sales/services/DeliveryService'
import { DeliveryStatus } from '@/core/models/Delivery'

const mockDelivery = {
  _id: 'del-001',
  code: 'DEL-000001',
  salesOrderId: 'so-001',
  warehouseId: 'wh-001',
  status: DeliveryStatus.Draft,
  expectedDeliveryDate: null,
  actualDeliveryDate: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
  deletedAt: null,
}

vi.mock('@/core/repositories/DeliveryRepository', () => ({
  DeliveryRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockImplementation(function (id: string) {
        if (id === 'nonexistent') return null
        return { ...mockDelivery }
      }),
      findBySalesOrder: vi.fn().mockReturnValue([]),
      search: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return { ...mockDelivery, ...input, _id: 'del-001' }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return { ...mockDelivery, ...changes, _id: id }
      }),
      softDelete: vi.fn().mockReturnValue(true),
    }
  }),
}))

vi.mock('@/core/repositories/DeliveryItemRepository', () => ({
  DeliveryItemRepository: vi.fn().mockImplementation(function () {
    return {
      findByDelivery: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return { _id: 'deli-001', ...input }
      }),
    }
  }),
}))

vi.mock('@/core/repositories/SalesOrderRepository', () => ({
  SalesOrderRepository: vi.fn().mockImplementation(function () {
    return {
      findById: vi.fn().mockReturnValue(null),
      update: vi.fn(),
    }
  }),
}))

vi.mock('@/core/repositories/SalesOrderItemRepository', () => ({
  SalesOrderItemRepository: vi.fn().mockImplementation(function () {
    return {
      findBySalesOrder: vi.fn().mockReturnValue([]),
    }
  }),
}))

vi.mock('@/core/repositories/StockMovementRepository', () => ({
  StockMovementRepository: vi.fn().mockImplementation(function () {
    return { create: vi.fn() }
  }),
}))

vi.mock('@/core/repositories/AuditRepository', () => ({
  AuditRepository: vi.fn().mockImplementation(function () {
    return { create: vi.fn() }
  }),
}))

describe('DeliveryService', () => {
  let service: DeliveryService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new DeliveryService()
  })

  describe('findAllDeliveries', () => {
    it('returns all deliveries', () => {
      expect(service.findAllDeliveries()).toEqual([])
    })
  })

  describe('findDeliveryById', () => {
    it('finds delivery by id', () => {
      expect(service.findDeliveryById('del-001')).toBeDefined()
    })

    it('returns null for nonexistent', () => {
      expect(service.findDeliveryById('nonexistent')).toBeNull()
    })
  })

  describe('confirmDelivery', () => {
    it('confirms a draft delivery', () => {
      const result = service.confirmDelivery('del-001', 'user-1', 'admin')
      expect(result.status).toBe(DeliveryStatus.Delivered)
    })

    it('throws when not draft', () => {
      const svc = service as unknown as { deliveryRepo: { findById: ReturnType<typeof vi.fn> } }
      svc.deliveryRepo.findById.mockReturnValue({ ...mockDelivery, status: DeliveryStatus.Delivered })
      expect(() => service.confirmDelivery('del-001')).toThrow('Only draft deliveries can be confirmed')
    })
  })

  describe('cancelDelivery', () => {
    it('cancels a draft delivery', () => {
      const result = service.cancelDelivery('del-001', 'user-1', 'admin')
      expect(result.status).toBe(DeliveryStatus.Cancelled)
    })

    it('throws when delivered', () => {
      const svc = service as unknown as { deliveryRepo: { findById: ReturnType<typeof vi.fn> } }
      svc.deliveryRepo.findById.mockReturnValue({ ...mockDelivery, status: DeliveryStatus.Delivered })
      expect(() => service.cancelDelivery('del-001')).toThrow('Cannot cancel a delivered or already cancelled delivery')
    })
  })

  describe('archiveDelivery', () => {
    it('archives a delivery', () => {
      expect(service.archiveDelivery('del-001', 'user-1', 'admin')).toBe(true)
    })
  })
})
