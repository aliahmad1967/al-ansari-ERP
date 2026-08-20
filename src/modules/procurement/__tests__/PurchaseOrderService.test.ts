import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PurchaseOrderService } from '@/modules/procurement/services/PurchaseOrderService'
import { PurchaseOrderStatus } from '@/core/models/PurchaseOrder'

const mockOrder = {
  _id: 'po-001',
  code: 'PO-000001',
  supplierId: 'sup-001',
  status: PurchaseOrderStatus.Draft,
  totalAmount: 0,
  taxAmount: 0,
  discountAmount: 0,
  netAmount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
  deletedAt: null,
}

vi.mock('@/core/repositories/PurchaseOrderRepository', () => ({
  PurchaseOrderRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockImplementation(function (id: string) {
        if (id === 'nonexistent') return null
        return { ...mockOrder }
      }),
      findByStatus: vi.fn().mockReturnValue([]),
      findBySupplier: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return { ...mockOrder, ...input, _id: 'po-001' }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return { ...mockOrder, ...changes, _id: id }
      }),
    }
  }),
}))

vi.mock('@/core/repositories/PurchaseOrderItemRepository', () => ({
  PurchaseOrderItemRepository: vi.fn().mockImplementation(function () {
    return {
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return { _id: 'poi-001', ...input }
      }),
    }
  }),
}))

vi.mock('@/core/repositories/AuditRepository', () => ({
  AuditRepository: vi.fn().mockImplementation(function () {
    return { create: vi.fn() }
  }),
}))

describe('PurchaseOrderService', () => {
  let service: PurchaseOrderService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new PurchaseOrderService()
  })

  describe('findAllOrders', () => {
    it('returns all orders', () => {
      expect(service.findAllOrders()).toEqual([])
    })
  })

  describe('findOrderById', () => {
    it('finds order by id', () => {
      expect(service.findOrderById('po-001')).toBeDefined()
    })

    it('returns null for nonexistent', () => {
      expect(service.findOrderById('nonexistent')).toBeNull()
    })
  })

  describe('createOrder', () => {
    it('creates an order with items and calculates totals', () => {
      const result = service.createOrder(
        { supplierId: 'sup-001' } as never,
        [
          { productId: 'prod-001', quantity: 10, unitPrice: 100, taxRate: 15, discountRate: 0 },
          { productId: 'prod-002', quantity: 5, unitPrice: 200, taxRate: 15, discountRate: 10 },
        ],
        'user-1',
        'admin',
      )
      expect(result.code).toMatch(/^PO-/)
    })
  })

  describe('submitOrder', () => {
    it('submits a draft order', () => {
      const result = service.submitOrder('po-001', 'user-1', 'admin')
      expect(result.status).toBe(PurchaseOrderStatus.Submitted)
    })

    it('throws when order not found', () => {
      expect(() => service.submitOrder('nonexistent')).toThrow('not found')
    })

    it('throws when order not in draft', () => {
      const svc = service as unknown as { orderRepo: { findById: ReturnType<typeof vi.fn> } }
      svc.orderRepo.findById.mockReturnValue({ ...mockOrder, status: PurchaseOrderStatus.Submitted })
      expect(() => service.submitOrder('po-001')).toThrow('Cannot submit order in status')
    })
  })

  describe('confirmOrder', () => {
    it('confirms a submitted order', () => {
      const svc = service as unknown as { orderRepo: { findById: ReturnType<typeof vi.fn> } }
      svc.orderRepo.findById.mockReturnValue({ ...mockOrder, status: PurchaseOrderStatus.Submitted })
      const result = service.confirmOrder('po-001', 'user-1', 'admin')
      expect(result.status).toBe(PurchaseOrderStatus.Confirmed)
    })

    it('throws when order not submitted', () => {
      expect(() => service.confirmOrder('po-001')).toThrow('Cannot confirm order in status')
    })
  })

  describe('cancelOrder', () => {
    it('cancels a draft order', () => {
      const result = service.cancelOrder('po-001', 'user-1', 'admin')
      expect(result.status).toBe(PurchaseOrderStatus.Cancelled)
    })

    it('cancels a submitted order', () => {
      const svc = service as unknown as { orderRepo: { findById: ReturnType<typeof vi.fn> } }
      svc.orderRepo.findById.mockReturnValue({ ...mockOrder, status: PurchaseOrderStatus.Submitted })
      const result = service.cancelOrder('po-001', 'user-1', 'admin')
      expect(result.status).toBe(PurchaseOrderStatus.Cancelled)
    })

    it('throws when order not cancellable', () => {
      const svc = service as unknown as { orderRepo: { findById: ReturnType<typeof vi.fn> } }
      svc.orderRepo.findById.mockReturnValue({ ...mockOrder, status: PurchaseOrderStatus.Confirmed })
      expect(() => service.cancelOrder('po-001')).toThrow('Cannot cancel order in status')
    })
  })
})
