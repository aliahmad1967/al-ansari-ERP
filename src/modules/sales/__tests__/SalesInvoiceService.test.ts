import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SalesInvoiceService } from '@/modules/sales/services/SalesInvoiceService'
import { SalesInvoiceStatus } from '@/core/models/SalesInvoice'

const mockInvoice = {
  _id: 'sinv-001',
  code: 'SINV-000001',
  customerId: 'cust-001',
  salesOrderId: 'so-001',
  status: SalesInvoiceStatus.Draft,
  totalAmount: 0,
  taxAmount: 0,
  discountAmount: 0,
  netAmount: 0,
  paidAmount: 0,
  dueDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
  deletedAt: null,
}

vi.mock('@/core/repositories/SalesInvoiceRepository', () => ({
  SalesInvoiceRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockImplementation(function (id: string) {
        if (id === 'nonexistent') return null
        return { ...mockInvoice }
      }),
      findOverdue: vi.fn().mockReturnValue([]),
      findByCustomer: vi.fn().mockReturnValue([]),
      search: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return { ...mockInvoice, ...input, _id: 'sinv-001' }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return { ...mockInvoice, ...changes, _id: id }
      }),
      softDelete: vi.fn().mockReturnValue(true),
    }
  }),
}))

vi.mock('@/core/repositories/SalesInvoiceItemRepository', () => ({
  SalesInvoiceItemRepository: vi.fn().mockImplementation(function () {
    return {
      findByInvoice: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return { _id: 'sini-001', ...input }
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

vi.mock('@/core/repositories/AuditRepository', () => ({
  AuditRepository: vi.fn().mockImplementation(function () {
    return { create: vi.fn() }
  }),
}))

describe('SalesInvoiceService', () => {
  let service: SalesInvoiceService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new SalesInvoiceService()
  })

  describe('findAllInvoices', () => {
    it('returns all invoices', () => {
      expect(service.findAllInvoices()).toEqual([])
    })
  })

  describe('findInvoiceById', () => {
    it('finds invoice by id', () => {
      expect(service.findInvoiceById('sinv-001')).toBeDefined()
    })

    it('returns null for nonexistent', () => {
      expect(service.findInvoiceById('nonexistent')).toBeNull()
    })
  })

  describe('findOverdueInvoices', () => {
    it('returns overdue invoices', () => {
      expect(service.findOverdueInvoices()).toEqual([])
    })
  })

  describe('createInvoice', () => {
    it('creates an invoice with items', () => {
      const result = service.createInvoice(
        { customerId: 'cust-001' } as never,
        [{ productId: 'prod-001', quantity: 10, unitPrice: 100, taxRate: 15, discountRate: 0 }],
        1,
        'user-1',
        'admin',
      )
      expect(result.code).toMatch(/^SINV-/)
    })
  })

  describe('finalizeInvoice', () => {
    it('finalizes a draft invoice', () => {
      const result = service.finalizeInvoice('sinv-001', 'user-1', 'admin')
      expect(result.status).toBe(SalesInvoiceStatus.Finalized)
    })

    it('throws when invoice not found', () => {
      expect(() => service.finalizeInvoice('nonexistent')).toThrow('Invoice not found')
    })

    it('throws when not draft', () => {
      const svc = service as unknown as { invoiceRepo: { findById: ReturnType<typeof vi.fn> } }
      svc.invoiceRepo.findById.mockReturnValue({ ...mockInvoice, status: SalesInvoiceStatus.Finalized })
      expect(() => service.finalizeInvoice('sinv-001')).toThrow('Only draft invoices can be finalized')
    })
  })

  describe('cancelInvoice', () => {
    it('cancels a draft invoice', () => {
      const result = service.cancelInvoice('sinv-001', 'user-1', 'admin')
      expect(result.status).toBe(SalesInvoiceStatus.Cancelled)
    })

    it('throws when invoice is paid', () => {
      const svc = service as unknown as { invoiceRepo: { findById: ReturnType<typeof vi.fn> } }
      svc.invoiceRepo.findById.mockReturnValue({ ...mockInvoice, status: SalesInvoiceStatus.Paid })
      expect(() => service.cancelInvoice('sinv-001')).toThrow('Cannot cancel a paid or already cancelled invoice')
    })

    it('throws when invoice is already cancelled', () => {
      const svc = service as unknown as { invoiceRepo: { findById: ReturnType<typeof vi.fn> } }
      svc.invoiceRepo.findById.mockReturnValue({ ...mockInvoice, status: SalesInvoiceStatus.Cancelled })
      expect(() => service.cancelInvoice('sinv-001')).toThrow('Cannot cancel a paid or already cancelled invoice')
    })
  })

  describe('archiveInvoice', () => {
    it('archives an invoice', () => {
      expect(service.archiveInvoice('sinv-001', 'user-1', 'admin')).toBe(true)
    })
  })
})
