import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AccountingDocumentService } from '@/modules/accounting/services/AccountingDocumentService'

vi.mock('@/core/repositories/AccountingPaymentRepository', () => ({
  AccountingPaymentRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockReturnValue(null),
      findByCode: vi.fn().mockReturnValue(null),
      search: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return {
          _id: 'pay-001',
          code: input.code,
          paymentDate: input.paymentDate,
          accountId: input.accountId,
          amount: input.amount,
          paymentMethod: input.paymentMethod,
          description: input.description,
          status: input.status ?? 'draft',
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          deletedAt: null,
        }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return { _id: id, code: 'PAY-001', status: changes.status ?? 'approved', createdAt: new Date(), updatedAt: new Date(), isDeleted: false, deletedAt: null }
      }),
      softDelete: vi.fn().mockReturnValue(true),
    }
  }),
}))

vi.mock('@/core/repositories/AccountingReceiptRepository', () => ({
  AccountingReceiptRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockReturnValue(null),
      findByCode: vi.fn().mockReturnValue(null),
      search: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return {
          _id: 'rcpt-001',
          code: input.code,
          receiptDate: input.receiptDate,
          accountId: input.accountId,
          amount: input.amount,
          receiptMethod: input.receiptMethod,
          description: input.description,
          status: input.status ?? 'draft',
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          deletedAt: null,
        }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return { _id: id, code: 'RCPT-001', status: changes.status ?? 'approved', createdAt: new Date(), updatedAt: new Date(), isDeleted: false, deletedAt: null }
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

describe('AccountingDocumentService', () => {
  let service: AccountingDocumentService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new AccountingDocumentService()
  })

  describe('createPayment', () => {
    it('creates a payment document', () => {
      const result = service.createPayment(
        {
          code: 'PAY-001',
          paymentDate: new Date(),
          accountId: 'acc-001',
          amount: 5000,
          paymentMethod: 'cash',
          description: 'Office supplies',
          payeeName: 'Supplier Co',
        },
        'user-1',
        'admin',
      )
      expect(result._id).toBe('pay-001')
      expect(result.code).toBe('PAY-001')
      expect(result.status).toBe('draft')
    })

    it('throws on duplicate code', () => {
      const repo = service['paymentRepo']
      repo.findByCode = vi.fn().mockReturnValue({ _id: 'existing' })
      expect(() =>
        service.createPayment({
          code: 'PAY-001',
          paymentDate: new Date(),
          accountId: 'acc-001',
          amount: 5000,
          paymentMethod: 'cash',
          description: 'Test',
          payeeName: 'Test',
        }),
      ).toThrow('already exists')
    })
  })

  describe('approvePayment', () => {
    it('approves a draft payment', () => {
      const repo = service['paymentRepo']
      repo.findById = vi.fn().mockReturnValue({ _id: 'pay-001', status: 'draft' })
      const result = service.approvePayment('pay-001', 'user-1', 'admin')
      expect(result.status).toBe('approved')
    })

    it('throws when payment is not draft', () => {
      const repo = service['paymentRepo']
      repo.findById = vi.fn().mockReturnValue({ _id: 'pay-001', status: 'posted' })
      expect(() => service.approvePayment('pay-001')).toThrow('Only draft')
    })
  })

  describe('cancelPayment', () => {
    it('cancels a payment', () => {
      const repo = service['paymentRepo']
      repo.findById = vi.fn().mockReturnValue({ _id: 'pay-001', status: 'draft' })
      const result = service.cancelPayment('pay-001')
      expect(result.status).toBe('cancelled')
    })

    it('throws when payment is posted', () => {
      const repo = service['paymentRepo']
      repo.findById = vi.fn().mockReturnValue({ _id: 'pay-001', status: 'posted' })
      expect(() => service.cancelPayment('pay-001')).toThrow('Cannot cancel posted')
    })
  })

  describe('createReceipt', () => {
    it('creates a receipt document', () => {
      const result = service.createReceipt(
        {
          code: 'RCPT-001',
          receiptDate: new Date(),
          accountId: 'acc-001',
          amount: 10000,
          receiptMethod: 'bank_transfer',
          description: 'Payment received',
          payerName: 'Customer Co',
        },
        'user-1',
        'admin',
      )
      expect(result._id).toBe('rcpt-001')
      expect(result.code).toBe('RCPT-001')
      expect(result.status).toBe('draft')
    })
  })

  describe('approveReceipt', () => {
    it('approves a draft receipt', () => {
      const repo = service['receiptRepo']
      repo.findById = vi.fn().mockReturnValue({ _id: 'rcpt-001', status: 'draft' })
      const result = service.approveReceipt('rcpt-001', 'user-1', 'admin')
      expect(result.status).toBe('approved')
    })
  })

  describe('cancelReceipt', () => {
    it('cancels a receipt', () => {
      const repo = service['receiptRepo']
      repo.findById = vi.fn().mockReturnValue({ _id: 'rcpt-001', status: 'draft' })
      const result = service.cancelReceipt('rcpt-001')
      expect(result.status).toBe('cancelled')
    })
  })
})
