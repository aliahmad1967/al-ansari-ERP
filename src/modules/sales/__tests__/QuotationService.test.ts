import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QuotationService } from '@/modules/sales/services/QuotationService'
import { QuotationStatus, type Quotation, type QuotationInput } from '@/core/models/Quotation'

const mockQuotation: Quotation = {
  _id: 'qt-001',
  code: 'QT-000001',
  quotationDate: new Date(),
  validUntilDate: new Date(Date.now() + 30 * 86400000),
  customerId: 'cust-001',
  salesOrderId: null,
  referenceNumber: null,
  totalAmount: 0,
  taxAmount: 0,
  discountAmount: 0,
  netAmount: 0,
  currency: 'SAR',
  status: QuotationStatus.Draft,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
  deletedAt: null,
} as Quotation

vi.mock('@/core/repositories/QuotationRepository', () => ({
  QuotationRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockImplementation(function (id: string) {
        if (id === 'nonexistent') return null
        return { ...mockQuotation }
      }),
      findValid: vi.fn().mockReturnValue([]),
      search: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: QuotationInput) {
        return { ...mockQuotation, ...input, _id: 'qt-001' }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Partial<QuotationInput>) {
        return { ...mockQuotation, ...changes, _id: id }
      }),
      softDelete: vi.fn().mockReturnValue(true),
    }
  }),
}))

vi.mock('@/core/repositories/QuotationItemRepository', () => ({
  QuotationItemRepository: vi.fn().mockImplementation(function () {
    return {
      findByQuotation: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return {
          _id: 'qi-001',
          ...input,
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

describe('QuotationService', () => {
  let service: QuotationService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new QuotationService()
  })

  describe('createQuotation', () => {
    it('creates a quotation with line items and totals', () => {
      const input: QuotationInput = {
        code: '',
        quotationDate: new Date(),
        validUntilDate: new Date(Date.now() + 30 * 86400000),
        customerId: 'cust-001',
      }
      const items = [
        { productId: 'prod-001', quantity: 10, unitPrice: 100, taxRate: 15, discountRate: 0, deliveredQuantity: 0, invoicedQuantity: 0 },
        { productId: 'prod-002', quantity: 5, unitPrice: 200, taxRate: 15, discountRate: 10, deliveredQuantity: 0, invoicedQuantity: 0 },
      ]
      const result = service.createQuotation(input, items, 1, 'user-1', 'admin')
      expect(result.code).toMatch(/^QT-/)
      expect(result.status).toBe(QuotationStatus.Draft)
    })
  })

  describe('sendQuotation', () => {
    it('sends a draft quotation', () => {
      const result = service.sendQuotation('qt-001', 'user-1', 'admin')
      expect(result.status).toBe(QuotationStatus.Sent)
    })

    it('throws when sending non-draft quotation', () => {
      const repo = (service as unknown as { quotationRepo: { findById: ReturnType<typeof vi.fn> } }).quotationRepo
      repo.findById.mockReturnValue({ ...mockQuotation, status: QuotationStatus.Sent })
      expect(() => service.sendQuotation('qt-001')).toThrow('Only draft quotations can be sent')
    })
  })

  describe('acceptQuotation', () => {
    it('accepts a sent quotation', () => {
      const repo = (service as unknown as { quotationRepo: { findById: ReturnType<typeof vi.fn> } }).quotationRepo
      repo.findById.mockReturnValue({ ...mockQuotation, status: QuotationStatus.Sent })
      const result = service.acceptQuotation('qt-001', 'user-1', 'admin')
      expect(result.status).toBe(QuotationStatus.Accepted)
    })

    it('throws when accepting non-sent quotation', () => {
      expect(() => service.acceptQuotation('qt-001')).toThrow('Only sent quotations can be accepted')
    })
  })

  describe('rejectQuotation', () => {
    it('rejects a sent quotation', () => {
      const repo = (service as unknown as { quotationRepo: { findById: ReturnType<typeof vi.fn> } }).quotationRepo
      repo.findById.mockReturnValue({ ...mockQuotation, status: QuotationStatus.Sent })
      const result = service.rejectQuotation('qt-001', 'user-1', 'admin')
      expect(result.status).toBe(QuotationStatus.Rejected)
    })

    it('throws when rejecting non-sent quotation', () => {
      expect(() => service.rejectQuotation('qt-001')).toThrow('Only sent quotations can be rejected')
    })
  })

  describe('markConverted', () => {
    it('marks quotation as converted with sales order reference', () => {
      service.markConverted('qt-001', 'so-001')
    })
  })

  describe('updateQuotation', () => {
    it('updates a draft quotation', () => {
      const result = service.updateQuotation('qt-001', { notes: 'Updated notes' })
      expect(result.notes).toBe('Updated notes')
    })

    it('throws when updating non-draft quotation', () => {
      const repo = (service as unknown as { quotationRepo: { findById: ReturnType<typeof vi.fn> } }).quotationRepo
      repo.findById.mockReturnValue({ ...mockQuotation, status: QuotationStatus.Sent })
      expect(() => service.updateQuotation('qt-001', { notes: 'x' })).toThrow('Only draft quotations can be edited')
    })
  })

  describe('archiveQuotation', () => {
    it('archives a quotation', () => {
      expect(service.archiveQuotation('qt-001', 'user-1', 'admin')).toBe(true)
    })
  })
})
