import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SalesReturnService } from '@/modules/sales/services/SalesReturnService'
import { SalesReturnStatus, type SalesReturn, type SalesReturnInput } from '@/core/models/SalesReturn'
import { StockMovementType } from '@/core/models/StockMovement'

const mockReturn: SalesReturn = {
  _id: 'sr-001',
  code: 'SR-000001',
  returnDate: new Date(),
  salesInvoiceId: 'inv-001',
  salesOrderId: 'so-001',
  customerId: 'cust-001',
  warehouseId: 'wh-001',
  reason: 'Defective product',
  totalAmount: 0,
  taxAmount: 0,
  netAmount: 0,
  currency: 'SAR',
  status: SalesReturnStatus.Draft,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
  deletedAt: null,
} as SalesReturn

const mockReturnItem = {
  _id: 'sri-001',
  salesReturnId: 'sr-001',
  salesInvoiceItemId: 'sii-001',
  productId: 'prod-001',
  quantityReturned: 5,
  unitPrice: 100,
  taxRate: 15,
  taxAmount: 75,
  totalAmount: 575,
  reason: 'Defective',
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
  deletedAt: null,
}

vi.mock('@/core/repositories/SalesReturnRepository', () => ({
  SalesReturnRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockImplementation(function (id: string) {
        if (id === 'nonexistent') return null
        return { ...mockReturn }
      }),
      findByCustomer: vi.fn().mockReturnValue([]),
      search: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: SalesReturnInput) {
        return { ...mockReturn, ...input, _id: 'sr-001' }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return { ...mockReturn, ...changes, _id: id }
      }),
      softDelete: vi.fn().mockReturnValue(true),
    }
  }),
}))

vi.mock('@/core/repositories/SalesReturnItemRepository', () => ({
  SalesReturnItemRepository: vi.fn().mockImplementation(function () {
    return {
      findByReturn: vi.fn().mockReturnValue([mockReturnItem]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return { _id: 'sri-001', ...input, createdAt: new Date(), updatedAt: new Date(), isDeleted: false, deletedAt: null }
      }),
    }
  }),
}))

vi.mock('@/core/repositories/StockMovementRepository', () => ({
  StockMovementRepository: vi.fn().mockImplementation(function () {
    return {
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return { _id: 'sm-001', ...input, totalCost: input.totalCost ?? 0, createdAt: new Date(), updatedAt: new Date() }
      }),
    }
  }),
}))

vi.mock('@/core/repositories/AuditRepository', () => ({
  AuditRepository: vi.fn().mockImplementation(function () {
    return { create: vi.fn() }
  }),
}))

describe('SalesReturnService', () => {
  let service: SalesReturnService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new SalesReturnService()
  })

  describe('createReturn', () => {
    it('creates a return with items and totals', () => {
      const input: SalesReturnInput = {
        code: '',
        returnDate: new Date(),
        salesInvoiceId: 'inv-001',
        customerId: 'cust-001',
        warehouseId: 'wh-001',
        reason: 'Defective product',
      }
      const items = [
        { salesInvoiceItemId: 'sii-001', productId: 'prod-001', quantityReturned: 5, unitPrice: 100, taxRate: 15, reason: 'Defective' },
      ]
      const result = service.createReturn(input, items, 1, 'user-1', 'admin')
      expect(result.code).toMatch(/^SR-/)
      expect(result.status).toBe(SalesReturnStatus.Draft)
    })
  })

  describe('approveReturn', () => {
    it('approves a draft return', () => {
      const result = service.approveReturn('sr-001', 'user-1', 'admin')
      expect(result.status).toBe(SalesReturnStatus.Approved)
    })

    it('throws when approving non-draft return', () => {
      const repo = (service as unknown as { returnRepo: { findById: ReturnType<typeof vi.fn> } }).returnRepo
      repo.findById.mockReturnValue({ ...mockReturn, status: SalesReturnStatus.Approved })
      expect(() => service.approveReturn('sr-001')).toThrow('Only draft returns can be approved')
    })
  })

  describe('processReturnStockMovements', () => {
    it('creates stock movements with type ReturnIn and positive quantity', () => {
      service.processReturnStockMovements('sr-001', 'user-1', 'admin')
      const stockRepo = (service as unknown as { stockMovementRepo: { create: ReturnType<typeof vi.fn> } }).stockMovementRepo
      expect(stockRepo.create).toHaveBeenCalledTimes(1)
      const call = stockRepo.create.mock.calls[0][0]
      expect(call.type).toBe(StockMovementType.ReturnIn)
      expect(call.quantity).toBe(5)
      expect(call.productId).toBe('prod-001')
      expect(call.warehouseId).toBe('wh-001')
      expect(call.unitCost).toBe(100)
      expect(call.referenceType).toBe('SalesReturn')
      expect(call.referenceId).toBe('sr-001')
      expect(call.referenceNumber).toBe('SR-000001')
    })

    it('marks return as Completed after processing', () => {
      const repo = (service as unknown as { returnRepo: { findById: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> } }).returnRepo
      service.processReturnStockMovements('sr-001', 'user-1', 'admin')
      expect(repo.update).toHaveBeenCalledWith('sr-001', { status: SalesReturnStatus.Completed })
    })

    it('throws when return not found', () => {
      const repo = (service as unknown as { returnRepo: { findById: ReturnType<typeof vi.fn> } }).returnRepo
      repo.findById.mockReturnValue(null)
      expect(() => service.processReturnStockMovements('nonexistent')).toThrow('Sales return not found')
    })
  })

  describe('rejectReturn', () => {
    it('rejects a draft return', () => {
      const result = service.rejectReturn('sr-001', 'user-1', 'admin')
      expect(result.status).toBe(SalesReturnStatus.Rejected)
    })

    it('rejects an approved return', () => {
      const repo = (service as unknown as { returnRepo: { findById: ReturnType<typeof vi.fn> } }).returnRepo
      repo.findById.mockReturnValue({ ...mockReturn, status: SalesReturnStatus.Approved })
      const result = service.rejectReturn('sr-001', 'user-1', 'admin')
      expect(result.status).toBe(SalesReturnStatus.Rejected)
    })

    it('throws when rejecting completed return', () => {
      const repo = (service as unknown as { returnRepo: { findById: ReturnType<typeof vi.fn> } }).returnRepo
      repo.findById.mockReturnValue({ ...mockReturn, status: SalesReturnStatus.Completed })
      expect(() => service.rejectReturn('sr-001')).toThrow('Cannot reject a completed or already rejected return')
    })

    it('throws when rejecting already rejected return', () => {
      const repo = (service as unknown as { returnRepo: { findById: ReturnType<typeof vi.fn> } }).returnRepo
      repo.findById.mockReturnValue({ ...mockReturn, status: SalesReturnStatus.Rejected })
      expect(() => service.rejectReturn('sr-001')).toThrow('Cannot reject a completed or already rejected return')
    })
  })

  describe('archiveReturn', () => {
    it('archives a return', () => {
      expect(service.archiveReturn('sr-001', 'user-1', 'admin')).toBe(true)
    })
  })
})
