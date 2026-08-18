import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DeliveryService } from '@/modules/sales/services/DeliveryService'
import { DeliveryStatus, type Delivery, type DeliveryInput } from '@/core/models/Delivery'
import { StockMovementType } from '@/core/models/StockMovement'
import { SalesOrderStatus } from '@/core/models/SalesOrder'

const mockDelivery: Delivery = {
  _id: 'del-001',
  code: 'DEL-000001',
  deliveryDate: new Date(),
  salesOrderId: 'so-001',
  customerId: 'cust-001',
  warehouseId: 'wh-001',
  shippedByUserId: null,
  trackingNumber: null,
  carrierName: null,
  expectedDeliveryDate: null,
  status: DeliveryStatus.Draft,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
  deletedAt: null,
} as Delivery

const mockDeliveryItem = {
  _id: 'di-001',
  deliveryId: 'del-001',
  salesOrderItemId: 'soi-001',
  productId: 'prod-001',
  quantityShipped: 10,
  batchNumber: 'BATCH-001',
  expiryDate: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
  deletedAt: null,
}

const mockSalesOrder = {
  _id: 'so-001',
  code: 'SO-000001',
  status: SalesOrderStatus.Confirmed,
}

const mockSalesOrderItem = {
  _id: 'soi-001',
  salesOrderId: 'so-001',
  productId: 'prod-001',
  quantity: 10,
  deliveredQuantity: 10,
  invoicedQuantity: 0,
  unitPrice: 100,
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
      create: vi.fn().mockImplementation(function (input: DeliveryInput) {
        return { ...mockDelivery, ...input, _id: 'del-001' }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Partial<DeliveryInput>) {
        return { ...mockDelivery, ...changes, _id: id }
      }),
      softDelete: vi.fn().mockReturnValue(true),
    }
  }),
}))

vi.mock('@/core/repositories/DeliveryItemRepository', () => ({
  DeliveryItemRepository: vi.fn().mockImplementation(function () {
    return {
      findByDelivery: vi.fn().mockReturnValue([mockDeliveryItem]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return { _id: 'di-001', ...input, createdAt: new Date(), updatedAt: new Date(), isDeleted: false, deletedAt: null }
      }),
    }
  }),
}))

vi.mock('@/core/repositories/StockMovementRepository', () => ({
  StockMovementRepository: vi.fn().mockImplementation(function () {
    return {
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return { _id: 'sm-001', ...input, unitCost: input.unitCost ?? 0, totalCost: input.totalCost ?? 0, createdAt: new Date(), updatedAt: new Date() }
      }),
    }
  }),
}))

vi.mock('@/core/repositories/SalesOrderRepository', () => ({
  SalesOrderRepository: vi.fn().mockImplementation(function () {
    return {
      findById: vi.fn().mockImplementation(function (id: string) {
        if (id === 'nonexistent') return null
        return { ...mockSalesOrder }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return { ...mockSalesOrder, ...changes, _id: id }
      }),
    }
  }),
}))

vi.mock('@/core/repositories/SalesOrderItemRepository', () => ({
  SalesOrderItemRepository: vi.fn().mockImplementation(function () {
    return {
      findBySalesOrder: vi.fn().mockReturnValue([mockSalesOrderItem]),
    }
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

  describe('createDelivery', () => {
    it('creates a delivery with items', () => {
      const input: DeliveryInput = {
        code: '',
        deliveryDate: new Date(),
        salesOrderId: 'so-001',
        customerId: 'cust-001',
        warehouseId: 'wh-001',
      }
      const items = [
        { salesOrderItemId: 'soi-001', productId: 'prod-001', quantityShipped: 10, batchNumber: 'BATCH-001' },
      ]
      const result = service.createDelivery(input, items, 1, 'user-1', 'admin')
      expect(result.code).toMatch(/^DEL-/)
      expect(result.status).toBe(DeliveryStatus.Draft)
    })
  })

  describe('confirmDelivery', () => {
    it('confirms a draft delivery', () => {
      const result = service.confirmDelivery('del-001', 'user-1', 'admin')
      expect(result.status).toBe(DeliveryStatus.Delivered)
    })

    it('throws when confirming non-draft delivery', () => {
      const repo = (service as unknown as { deliveryRepo: { findById: ReturnType<typeof vi.fn> } }).deliveryRepo
      repo.findById.mockReturnValue({ ...mockDelivery, status: DeliveryStatus.Delivered })
      expect(() => service.confirmDelivery('del-001')).toThrow('Only draft deliveries can be confirmed')
    })
  })

  describe('processStockMovements', () => {
    it('creates stock movements with type Sale and negative quantity', () => {
      service.processStockMovements('del-001', 'user-1', 'admin')
      const stockRepo = (service as unknown as { stockMovementRepo: { create: ReturnType<typeof vi.fn> } }).stockMovementRepo
      expect(stockRepo.create).toHaveBeenCalledTimes(1)
      const call = stockRepo.create.mock.calls[0][0]
      expect(call.type).toBe(StockMovementType.Sale)
      expect(call.quantity).toBe(-10)
      expect(call.productId).toBe('prod-001')
      expect(call.warehouseId).toBe('wh-001')
      expect(call.referenceType).toBe('Delivery')
      expect(call.referenceId).toBe('del-001')
      expect(call.referenceNumber).toBe('DEL-000001')
      expect(call.batchNumber).toBe('BATCH-001')
    })

    it('updates sales order delivery status to Delivered when all items delivered', () => {
      service.processStockMovements('del-001', 'user-1', 'admin')
      const soRepo = (service as unknown as { salesOrderRepo: { update: ReturnType<typeof vi.fn> } }).salesOrderRepo
      expect(soRepo.update).toHaveBeenCalledWith('so-001', { status: SalesOrderStatus.Delivered })
    })

    it('updates sales order to PartiallyDelivered when some items delivered', () => {
      const soItemRepo = (service as unknown as { salesOrderItemRepo: { findBySalesOrder: ReturnType<typeof vi.fn> } }).salesOrderItemRepo
      soItemRepo.findBySalesOrder.mockReturnValue([{ ...mockSalesOrderItem, deliveredQuantity: 5 }])
      service.processStockMovements('del-001', 'user-1', 'admin')
      const soRepo = (service as unknown as { salesOrderRepo: { update: ReturnType<typeof vi.fn> } }).salesOrderRepo
      expect(soRepo.update).toHaveBeenCalledWith('so-001', { status: SalesOrderStatus.PartiallyDelivered })
    })

    it('throws when delivery not found', () => {
      const repo = (service as unknown as { deliveryRepo: { findById: ReturnType<typeof vi.fn> } }).deliveryRepo
      repo.findById.mockReturnValue(null)
      expect(() => service.processStockMovements('nonexistent')).toThrow('Delivery not found')
    })
  })

  describe('cancelDelivery', () => {
    it('cancels a draft delivery', () => {
      const result = service.cancelDelivery('del-001', 'user-1', 'admin')
      expect(result.status).toBe(DeliveryStatus.Cancelled)
    })

    it('rejects cancelling a delivered delivery', () => {
      const repo = (service as unknown as { deliveryRepo: { findById: ReturnType<typeof vi.fn> } }).deliveryRepo
      repo.findById.mockReturnValue({ ...mockDelivery, status: DeliveryStatus.Delivered })
      expect(() => service.cancelDelivery('del-001')).toThrow('Cannot cancel a delivered or already cancelled delivery')
    })

    it('rejects cancelling an already cancelled delivery', () => {
      const repo = (service as unknown as { deliveryRepo: { findById: ReturnType<typeof vi.fn> } }).deliveryRepo
      repo.findById.mockReturnValue({ ...mockDelivery, status: DeliveryStatus.Cancelled })
      expect(() => service.cancelDelivery('del-001')).toThrow('Cannot cancel a delivered or already cancelled delivery')
    })
  })

  describe('archiveDelivery', () => {
    it('archives a delivery', () => {
      expect(service.archiveDelivery('del-001', 'user-1', 'admin')).toBe(true)
    })
  })
})
