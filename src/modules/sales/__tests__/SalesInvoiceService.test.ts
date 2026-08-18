import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SalesInvoiceService } from '@/modules/sales/services/SalesInvoiceService'
import { SalesInvoiceStatus, type SalesInvoice, type SalesInvoiceInput } from '@/core/models/SalesInvoice'

const mockInvoice: SalesInvoice = {
  _id: 'inv-001',
  code: 'SINV-000001',
  invoiceDate: new Date(),
  dueDate: new Date(Date.now() + 30 * 86400000),
  customerId: 'cust-001',
  salesOrderId: 'so-001',
  deliveryId: 'del-001',
  referenceNumber: null,
  totalAmount: 1150,
  taxAmount: 150,
  discountAmount: 0,
  netAmount: 1150,
  paidAmount: 0,
  currency: 'SAR',
  status: SalesInvoiceStatus.Draft,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
  deletedAt: null,
} as SalesInvoice

vi.mock('@/core/repositories/SalesInvoiceRepository', () => ({
  SalesInvoiceRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockImplementation(function (id: string) {
        if (id === 'nonexistent') return null
        return { ...mockInvoice }
      }),
      findByCustomer: vi.fn().mockReturnValue([]),
      findOverdue: vi.fn().mockReturnValue([]),
      search: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: SalesInvoiceInput) {
        return { ...mockInvoice, ...input, _id: 'inv-001' }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Partial<SalesInvoiceInput>) {
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
        return { _id: 'sii-001', ...input, createdAt: new Date(), updatedAt: new Date(), isDeleted: false, deletedAt: null }
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

  describe('createInvoice', () => {
    it('creates an invoice with line items and totals', () => {
      const input: SalesInvoiceInput = {
        code: '',
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 86400000),
        customerId: 'cust-001',
        salesOrderId: 'so-001',
        deliveryId: 'del-001',
      }
      const items = [
        { productId: 'prod-001', quantity: 10, unitPrice: 100, taxRate: 15, discountRate: 0, deliveredQuantity: 10, invoicedQuantity: 0 },
      ]
      const result = service.createInvoice(input, items, 1, 'user-1', 'admin')
      expect(result.code).toMatch(/^SINV-/)
      expect(result.status).toBe(SalesInvoiceStatus.Draft)
    })
  })

  describe('finalizeInvoice', () => {
    it('finalizes a draft invoice', () => {
      const result = service.finalizeInvoice('inv-001', 'user-1', 'admin')
      expect(result.status).toBe(SalesInvoiceStatus.Finalized)
    })

    it('throws when finalizing non-draft invoice', () => {
      const repo = (service as unknown as { invoiceRepo: { findById: ReturnType<typeof vi.fn> } }).invoiceRepo
      repo.findById.mockReturnValue({ ...mockInvoice, status: SalesInvoiceStatus.Finalized })
      expect(() => service.finalizeInvoice('inv-001')).toThrow('Only draft invoices can be finalized')
    })
  })

  describe('updateInvoice - immutability enforcement', () => {
    it('allows editing a draft invoice', () => {
      const result = service.updateInvoice('inv-001', { notes: 'Updated' })
      expect(result.notes).toBe('Updated')
    })

    it('rejects editing a finalized invoice', () => {
      const repo = (service as unknown as { invoiceRepo: { findById: ReturnType<typeof vi.fn> } }).invoiceRepo
      repo.findById.mockReturnValue({ ...mockInvoice, status: SalesInvoiceStatus.Finalized })
      expect(() => service.updateInvoice('inv-001', { notes: 'x' })).toThrow('Only draft invoices can be edited')
    })

    it('rejects editing a sent invoice', () => {
      const repo = (service as unknown as { invoiceRepo: { findById: ReturnType<typeof vi.fn> } }).invoiceRepo
      repo.findById.mockReturnValue({ ...mockInvoice, status: SalesInvoiceStatus.Sent })
      expect(() => service.updateInvoice('inv-001', { notes: 'x' })).toThrow('Only draft invoices can be edited')
    })

    it('rejects editing a paid invoice', () => {
      const repo = (service as unknown as { invoiceRepo: { findById: ReturnType<typeof vi.fn> } }).invoiceRepo
      repo.findById.mockReturnValue({ ...mockInvoice, status: SalesInvoiceStatus.Paid })
      expect(() => service.updateInvoice('inv-001', { notes: 'x' })).toThrow('Only draft invoices can be edited')
    })

    it('rejects editing a partially_paid invoice', () => {
      const repo = (service as unknown as { invoiceRepo: { findById: ReturnType<typeof vi.fn> } }).invoiceRepo
      repo.findById.mockReturnValue({ ...mockInvoice, status: SalesInvoiceStatus.PartiallyPaid })
      expect(() => service.updateInvoice('inv-001', { notes: 'x' })).toThrow('Only draft invoices can be edited')
    })
  })

  describe('cancelInvoice', () => {
    it('cancels a draft invoice', () => {
      const result = service.cancelInvoice('inv-001', 'user-1', 'admin')
      expect(result.status).toBe(SalesInvoiceStatus.Cancelled)
    })

    it('cancels a finalized invoice', () => {
      const repo = (service as unknown as { invoiceRepo: { findById: ReturnType<typeof vi.fn> } }).invoiceRepo
      repo.findById.mockReturnValue({ ...mockInvoice, status: SalesInvoiceStatus.Finalized })
      const result = service.cancelInvoice('inv-001', 'user-1', 'admin')
      expect(result.status).toBe(SalesInvoiceStatus.Cancelled)
    })

    it('rejects cancelling a paid invoice', () => {
      const repo = (service as unknown as { invoiceRepo: { findById: ReturnType<typeof vi.fn> } }).invoiceRepo
      repo.findById.mockReturnValue({ ...mockInvoice, status: SalesInvoiceStatus.Paid })
      expect(() => service.cancelInvoice('inv-001')).toThrow('Cannot cancel a paid or already cancelled invoice')
    })

    it('rejects cancelling an already cancelled invoice', () => {
      const repo = (service as unknown as { invoiceRepo: { findById: ReturnType<typeof vi.fn> } }).invoiceRepo
      repo.findById.mockReturnValue({ ...mockInvoice, status: SalesInvoiceStatus.Cancelled })
      expect(() => service.cancelInvoice('inv-001')).toThrow('Cannot cancel a paid or already cancelled invoice')
    })
  })

  describe('updatePaidAmount', () => {
    it('updates the paid amount on an invoice', () => {
      service.updatePaidAmount('inv-001', 500)
    })
  })

  describe('archiveInvoice', () => {
    it('archives an invoice', () => {
      expect(service.archiveInvoice('inv-001', 'user-1', 'admin')).toBe(true)
    })
  })
})
