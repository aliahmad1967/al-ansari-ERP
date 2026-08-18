import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CustomerPaymentService } from '@/modules/sales/services/CustomerPaymentService'
import { CustomerPaymentStatus, type CustomerPayment, type CustomerPaymentInput } from '@/core/models/CustomerPayment'
import { SalesInvoiceStatus, type SalesInvoice } from '@/core/models/SalesInvoice'

const mockPayment: CustomerPayment = {
  _id: 'pay-001',
  code: 'CPAY-000001',
  paymentDate: new Date(),
  salesInvoiceId: 'inv-001',
  customerId: 'cust-001',
  amount: 500,
  paymentMethod: 'bank_transfer',
  referenceNumber: null,
  status: CustomerPaymentStatus.Draft,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
  deletedAt: null,
} as CustomerPayment

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
  status: SalesInvoiceStatus.Finalized,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
  deletedAt: null,
} as SalesInvoice

vi.mock('@/core/repositories/CustomerPaymentRepository', () => ({
  CustomerPaymentRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockImplementation(function (id: string) {
        if (id === 'nonexistent') return null
        return { ...mockPayment }
      }),
      findByInvoice: vi.fn().mockReturnValue([]),
      findByCustomer: vi.fn().mockReturnValue([]),
      search: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: CustomerPaymentInput) {
        return { ...mockPayment, ...input, _id: 'pay-001' }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return { ...mockPayment, ...changes, _id: id }
      }),
      softDelete: vi.fn().mockReturnValue(true),
    }
  }),
}))

vi.mock('@/core/repositories/SalesInvoiceRepository', () => ({
  SalesInvoiceRepository: vi.fn().mockImplementation(function () {
    return {
      findById: vi.fn().mockImplementation(function (id: string) {
        if (id === 'nonexistent') return null
        return { ...mockInvoice }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return { ...mockInvoice, ...changes, _id: id }
      }),
    }
  }),
}))

vi.mock('@/core/repositories/AuditRepository', () => ({
  AuditRepository: vi.fn().mockImplementation(function () {
    return { create: vi.fn() }
  }),
}))

describe('CustomerPaymentService', () => {
  let service: CustomerPaymentService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new CustomerPaymentService()
  })

  describe('createPayment', () => {
    it('creates a payment with code', () => {
      const input: CustomerPaymentInput = {
        code: '',
        paymentDate: new Date(),
        salesInvoiceId: 'inv-001',
        customerId: 'cust-001',
        amount: 500,
        paymentMethod: 'bank_transfer',
      }
      const result = service.createPayment(input, 1, 'user-1', 'admin')
      expect(result.code).toMatch(/^CPAY-/)
      expect(result.status).toBe(CustomerPaymentStatus.Draft)
    })
  })

  describe('completePayment', () => {
    it('completes a draft payment', () => {
      const result = service.completePayment('pay-001', 'user-1', 'admin')
      expect(result.status).toBe(CustomerPaymentStatus.Completed)
    })

    it('updates invoice paidAmount and sets PartiallyPaid when partially paid', () => {
      const repo = (service as unknown as { invoiceRepo: { findById: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> } }).invoiceRepo
      repo.findById.mockReturnValue({ ...mockInvoice, paidAmount: 0, netAmount: 1150, status: SalesInvoiceStatus.Finalized })
      service.completePayment('pay-001', 'user-1', 'admin')
      expect(repo.update).toHaveBeenCalledWith('inv-001', expect.objectContaining({ paidAmount: 500, status: SalesInvoiceStatus.PartiallyPaid }))
    })

    it('sets invoice to Paid when fully paid', () => {
      const invRepo = (service as unknown as { invoiceRepo: { findById: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> } }).invoiceRepo
      invRepo.findById.mockReturnValue({ ...mockInvoice, paidAmount: 650, netAmount: 1150, status: SalesInvoiceStatus.PartiallyPaid })
      const payRepo = (service as unknown as { paymentRepo: { findById: ReturnType<typeof vi.fn> } }).paymentRepo
      payRepo.findById.mockReturnValue({ ...mockPayment, amount: 500, status: CustomerPaymentStatus.Draft })
      service.completePayment('pay-001', 'user-1', 'admin')
      expect(invRepo.update).toHaveBeenCalledWith('inv-001', expect.objectContaining({ paidAmount: 1150, status: SalesInvoiceStatus.Paid }))
    })

    it('throws when completing non-draft payment', () => {
      const repo = (service as unknown as { paymentRepo: { findById: ReturnType<typeof vi.fn> } }).paymentRepo
      repo.findById.mockReturnValue({ ...mockPayment, status: CustomerPaymentStatus.Completed })
      expect(() => service.completePayment('pay-001')).toThrow('Only draft payments can be completed')
    })
  })

  describe('cancelPayment', () => {
    it('cancels a draft payment', () => {
      const result = service.cancelPayment('pay-001', 'user-1', 'admin')
      expect(result.status).toBe(CustomerPaymentStatus.Cancelled)
    })

    it('cancels a completed payment and adjusts invoice', () => {
      const payRepo = (service as unknown as { paymentRepo: { findById: ReturnType<typeof vi.fn> } }).paymentRepo
      payRepo.findById.mockReturnValue({ ...mockPayment, amount: 500, status: CustomerPaymentStatus.Completed })
      const invRepo = (service as unknown as { invoiceRepo: { findById: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> } }).invoiceRepo
      invRepo.findById.mockReturnValue({ ...mockInvoice, paidAmount: 1150, netAmount: 1150, status: SalesInvoiceStatus.Paid })
      service.cancelPayment('pay-001', 'user-1', 'admin')
      expect(invRepo.update).toHaveBeenCalledWith('inv-001', expect.objectContaining({ paidAmount: 650, status: SalesInvoiceStatus.PartiallyPaid }))
    })

    it('reverts invoice to Finalized when paidAmount becomes 0', () => {
      const payRepo = (service as unknown as { paymentRepo: { findById: ReturnType<typeof vi.fn> } }).paymentRepo
      payRepo.findById.mockReturnValue({ ...mockPayment, amount: 500, status: CustomerPaymentStatus.Completed })
      const invRepo = (service as unknown as { invoiceRepo: { findById: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> } }).invoiceRepo
      invRepo.findById.mockReturnValue({ ...mockInvoice, paidAmount: 500, netAmount: 1150, status: SalesInvoiceStatus.PartiallyPaid })
      service.cancelPayment('pay-001', 'user-1', 'admin')
      expect(invRepo.update).toHaveBeenCalledWith('inv-001', expect.objectContaining({ paidAmount: 0, status: SalesInvoiceStatus.Finalized }))
    })

    it('throws when cancelling already cancelled payment', () => {
      const repo = (service as unknown as { paymentRepo: { findById: ReturnType<typeof vi.fn> } }).paymentRepo
      repo.findById.mockReturnValue({ ...mockPayment, status: CustomerPaymentStatus.Cancelled })
      expect(() => service.cancelPayment('pay-001')).toThrow('Payment is already cancelled')
    })
  })

  describe('archivePayment', () => {
    it('archives a payment', () => {
      expect(service.archivePayment('pay-001', 'user-1', 'admin')).toBe(true)
    })
  })
})
