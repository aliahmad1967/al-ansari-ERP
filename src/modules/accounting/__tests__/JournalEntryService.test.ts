import { describe, it, expect, vi, beforeEach } from 'vitest'
import { JournalEntryService } from '@/modules/accounting/services/JournalEntryService'
import { JournalEntryStatus } from '@/core/models/JournalEntry'

const mockEntry = {
  _id: 'je-001',
  code: 'JE-000001',
  entryDate: new Date(),
  fiscalYearId: 'fy-001',
  fiscalPeriodId: 'fp-001',
  referenceType: 'Manual',
  referenceId: null,
  referenceNumber: null,
  description: 'Test entry',
  notes: null,
  status: JournalEntryStatus.Draft,
  reversalOfId: null,
  totalDebit: 1000,
  totalCredit: 1000,
  currency: 'SAR',
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
  deletedAt: null,
}

const mockAccount = {
  _id: 'acc-001',
  code: '1010',
  name: 'Cash',
  type: 'asset',
  isActive: true,
  normalBalance: 'debit',
}

const mockPeriod = {
  _id: 'fp-001',
  status: 'open',
}

vi.mock('@/core/repositories/JournalEntryRepository', () => ({
  JournalEntryRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockImplementation(function (id: string) {
        if (id === 'nonexistent') return null
        return { ...mockEntry }
      }),
      findByCode: vi.fn().mockReturnValue(null),
      findByStatus: vi.fn().mockReturnValue([]),
      findByFiscalYear: vi.fn().mockReturnValue([]),
      findByFiscalPeriod: vi.fn().mockReturnValue([]),
      findByDateRange: vi.fn().mockReturnValue([]),
      search: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return { ...mockEntry, ...input, _id: 'je-001' }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return { ...mockEntry, ...changes, _id: id }
      }),
    }
  }),
}))

vi.mock('@/core/repositories/JournalEntryLineRepository', () => ({
  JournalEntryLineRepository: vi.fn().mockImplementation(function () {
    return {
      findByJournalEntry: vi.fn().mockReturnValue([
        { _id: 'jel-001', journalEntryId: 'je-001', accountId: 'acc-001', debit: 1000, credit: 0 },
        { _id: 'jel-002', journalEntryId: 'je-001', accountId: 'acc-002', debit: 0, credit: 1000 },
      ]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return { _id: 'jel-001', ...input }
      }),
    }
  }),
}))

vi.mock('@/core/repositories/LedgerTransactionRepository', () => ({
  LedgerTransactionRepository: vi.fn().mockImplementation(function () {
    return {
      create: vi.fn(),
      findByAccount: vi.fn().mockReturnValue([]),
    }
  }),
}))

vi.mock('@/core/repositories/AccountRepository', () => ({
  AccountRepository: vi.fn().mockImplementation(function () {
    return {
      findById: vi.fn().mockImplementation(function (id: string) {
        if (id === 'acc-001' || id === 'acc-002') return { ...mockAccount, _id: id }
        return null
      }),
    }
  }),
}))

vi.mock('@/core/repositories/FiscalPeriodRepository', () => ({
  FiscalPeriodRepository: vi.fn().mockImplementation(function () {
    return {
      findById: vi.fn().mockImplementation(function (id: string) {
        if (id === 'fp-001') return { ...mockPeriod }
        return null
      }),
    }
  }),
}))

vi.mock('@/core/repositories/AuditRepository', () => ({
  AuditRepository: vi.fn().mockImplementation(function () {
    return { create: vi.fn() }
  }),
}))

describe('JournalEntryService', () => {
  let service: JournalEntryService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new JournalEntryService()
  })

  describe('findAllEntries', () => {
    it('returns all entries', () => {
      expect(service.findAllEntries()).toEqual([])
    })
  })

  describe('findEntryById', () => {
    it('finds entry by id', () => {
      expect(service.findEntryById('je-001')).toBeDefined()
    })

    it('returns null for nonexistent', () => {
      expect(service.findEntryById('nonexistent')).toBeNull()
    })
  })

  describe('createDraftEntry', () => {
    it('creates a balanced journal entry', () => {
      const result = service.createDraftEntry(
        {
          entryDate: new Date(),
          fiscalYearId: 'fy-001',
          fiscalPeriodId: 'fp-001',
          description: 'Test entry',
          lines: [
            { accountId: 'acc-001', debit: 1000, credit: 0 },
            { accountId: 'acc-002', debit: 0, credit: 1000 },
          ],
        },
        'user-1',
        'admin',
      )
      expect(result.status).toBe(JournalEntryStatus.Draft)
      expect(result.totalDebit).toBe(1000)
      expect(result.totalCredit).toBe(1000)
    })

    it('rejects entry with less than 2 lines', () => {
      expect(() =>
        service.createDraftEntry({
          entryDate: new Date(),
          fiscalYearId: 'fy-001',
          fiscalPeriodId: 'fp-001',
          description: 'Single line',
          lines: [{ accountId: 'acc-001', debit: 1000, credit: 0 }],
        }),
      ).toThrow('at least 2 lines')
    })

    it('rejects unbalanced entry', () => {
      expect(() =>
        service.createDraftEntry({
          entryDate: new Date(),
          fiscalYearId: 'fy-001',
          fiscalPeriodId: 'fp-001',
          description: 'Unbalanced',
          lines: [
            { accountId: 'acc-001', debit: 1000, credit: 0 },
            { accountId: 'acc-002', debit: 0, credit: 500 },
          ],
        }),
      ).toThrow('Debit/Credit mismatch')
    })

    it('rejects entry with inactive account', () => {
      expect(() =>
        service.createDraftEntry({
          entryDate: new Date(),
          fiscalYearId: 'fy-001',
          fiscalPeriodId: 'fp-001',
          description: 'Inactive account',
          lines: [
            { accountId: 'nonexistent', debit: 1000, credit: 0 },
            { accountId: 'acc-001', debit: 0, credit: 1000 },
          ],
        }),
      ).toThrow('Account not found')
    })

    it('rejects entry in closed period', () => {
      const svc = service as unknown as { periodRepo: { findById: ReturnType<typeof vi.fn> } }
      svc.periodRepo.findById.mockReturnValue({ _id: 'fp-001', status: 'closed' })
      expect(() =>
        service.createDraftEntry({
          entryDate: new Date(),
          fiscalYearId: 'fy-001',
          fiscalPeriodId: 'fp-001',
          description: 'Closed period',
          lines: [
            { accountId: 'acc-001', debit: 1000, credit: 0 },
            { accountId: 'acc-002', debit: 0, credit: 1000 },
          ],
        }),
      ).toThrow('Fiscal period is not open')
    })
  })

  describe('reviewEntry', () => {
    it('reviews a draft entry', () => {
      const result = service.reviewEntry('je-001', 'user-1', 'admin')
      expect(result.status).toBe(JournalEntryStatus.Reviewed)
    })

    it('throws for nonexistent entry', () => {
      expect(() => service.reviewEntry('nonexistent')).toThrow('not found')
    })

    it('throws for non-draft entry', () => {
      const svc = service as unknown as { entryRepo: { findById: ReturnType<typeof vi.fn> } }
      svc.entryRepo.findById.mockReturnValue({ ...mockEntry, status: JournalEntryStatus.Reviewed })
      expect(() => service.reviewEntry('je-001')).toThrow('Only draft entries can be reviewed')
    })
  })

  describe('approveEntry', () => {
    it('approves a reviewed entry', () => {
      const svc = service as unknown as { entryRepo: { findById: ReturnType<typeof vi.fn> } }
      svc.entryRepo.findById.mockReturnValue({ ...mockEntry, status: JournalEntryStatus.Reviewed })
      const result = service.approveEntry('je-001', 'user-1', 'admin')
      expect(result.status).toBe(JournalEntryStatus.Approved)
    })

    it('throws for non-reviewed entry', () => {
      expect(() => service.approveEntry('je-001')).toThrow('Only reviewed entries can be approved')
    })
  })
})
