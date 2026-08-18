import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SalesOrderService } from '@/modules/sales/services/SalesOrderService'
import { SalesOrderStatus, type SalesOrder, type SalesOrderInput } from '@/core/models/SalesOrder'

const mockOrder: SalesOrder = {
  _id: 'so-001',
  code: 'SO-000001',
  orderDate: new Date(),
  customerId: 'cust-001',
  quotationId: 'qt-001',
  expectedDeliveryDate: null,
  referenceNumber: null,
  totalAmount: 1000,
  taxAmount: 150,
  discountAmount: 0,
  netAmount: 1150,
  currency: 'SAR',
  status: SalesOrderStatus.Draft,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
  deletedAt: null,
} as SalesOrder

vi.mock('@/core/repositories/SalesOrderRepository', () => ({
  SalesOrderRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockImplementation(function (id: string) {
        if (id === 'nonexistent') return null
        return { ...mockOrder }
      }),
      findByCustomer: vi.fn().mockReturnValue([]),
      search: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: SalesOrderInput) {
        return { ...mockOrder, ...input, _id: 'so-001' }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Partial<SalesOrderInput>) {
        return { ...mockOrder, ...changes, _id: id }
      }),
      softDelete: vi.fn().mockReturnValue(true),
    }
  }),
}))

vi.mock('@/core/repositories/SalesOrderItemRepository', () => ({
  SalesOrderItemRepository: vi.fn().mockImplementation(function () {
    return {
      findBySalesOrder: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return {
          _id: 'soi-001',
          ...input,
          deliveredQuantity: 0,
          invoicedQuantity: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          deletedAt: null,
        }
      }),
    }
  }),
}))

vi.mock('@/core/repositories/AuditRepository', () => ({
  AuditRepository: vi.fn().mockImplementation(function () {
    return { create: vi.fn() }
  }),
}))

describe('SalesOrderService', () => {
  let service: SalesOrderService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new SalesOrderService()
  })

  describe('createSalesOrder', () => {
    it('creates a sales order with items and totals', () => {
      const input: SalesOrderInput = {
        code: '',
        orderDate: new Date(),
        customerId: 'cust-001',
        quotationId: 'qt-001',
      }
      const items = [
        { productId: 'prod-001', quantity: 10, unitPrice: 100, taxRate: 15, discountRate: 0, deliveredQuantity: 0, invoicedQuantity: 0 },
      ]
      const result = service.createSalesOrder(input, items, 1, 'user-1', 'admin')
      expect(result.code).toMatch(/^SO-/)
      expect(result.status).toBe(SalesOrderStatus.Draft)
    })
  })

  describe('confirmSalesOrder', () => {
    it('confirms a draft order', () => {
      const result = service.confirmSalesOrder('so-001', 'user-1', 'admin')
      expect(result.status).toBe(SalesOrderStatus.Confirmed)
    })

    it('throws when confirming non-draft order', () => {
      const repo = (service as unknown as { salesOrderRepo: { findById: ReturnType<typeof vi.fn> } }).salesOrderRepo
      repo.findById.mockReturnValue({ ...mockOrder, status: SalesOrderStatus.Confirmed })
      expect(() => service.confirmSalesOrder('so-001')).toThrow('Only draft orders can be confirmed')
    })
  })

  describe('cancelSalesOrder', () => {
    it('cancels a draft order', () => {
      const result = service.cancelSalesOrder('so-001', 'user-1', 'admin')
      expect(result.status).toBe(SalesOrderStatus.Cancelled)
    })

    it('cancels a confirmed order', () => {
      const repo = (service as unknown as { salesOrderRepo: { findById: ReturnType<typeof vi.fn> } }).salesOrderRepo
      repo.findById.mockReturnValue({ ...mockOrder, status: SalesOrderStatus.Confirmed })
      const result = service.cancelSalesOrder('so-001', 'user-1', 'admin')
      expect(result.status).toBe(SalesOrderStatus.Cancelled)
    })

    it('rejects cancelling a completed order', () => {
      const repo = (service as unknown as { salesOrderRepo: { findById: ReturnType<typeof vi.fn> } }).salesOrderRepo
      repo.findById.mockReturnValue({ ...mockOrder, status: SalesOrderStatus.Completed })
      expect(() => service.cancelSalesOrder('so-001')).toThrow('Cannot cancel a completed or already cancelled order')
    })

    it('rejects cancelling an already cancelled order', () => {
      const repo = (service as unknown as { salesOrderRepo: { findById: ReturnType<typeof vi.fn> } }).salesOrderRepo
      repo.findById.mockReturnValue({ ...mockOrder, status: SalesOrderStatus.Cancelled })
      expect(() => service.cancelSalesOrder('so-001')).toThrow('Cannot cancel a completed or already cancelled order')
    })
  })

  describe('updateSalesOrder', () => {
    it('updates a draft order', () => {
      const result = service.updateSalesOrder('so-001', { notes: 'Updated' })
      expect(result.notes).toBe('Updated')
    })

    it('throws when updating non-draft order', () => {
      const repo = (service as unknown as { salesOrderRepo: { findById: ReturnType<typeof vi.fn> } }).salesOrderRepo
      repo.findById.mockReturnValue({ ...mockOrder, status: SalesOrderStatus.Confirmed })
      expect(() => service.updateSalesOrder('so-001', { notes: 'x' })).toThrow('Only draft orders can be edited')
    })
  })

  describe('archiveSalesOrder', () => {
    it('archives a sales order', () => {
      expect(service.archiveSalesOrder('so-001', 'user-1', 'admin')).toBe(true)
    })
  })
})
