import { describe, it, expect, vi, beforeEach } from 'vitest'
import { JournalEntryService } from '@/modules/accounting/services/JournalEntryService'

const mockAccount = {
  _id: 'acc-001',
  code: '1000',
  name: 'Cash',
  type: 'asset',
  isActive: true,
}

const mockPeriod = {
  _id: 'period-001',
  fiscalYearId: 'fy-001',
  code: '2026-01',
  name: 'January 2026',
  status: 'open',
}

vi.mock('@/core/repositories/JournalEntryRepository', () => ({
  JournalEntryRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockReturnValue(null),
      findByCode: vi.fn().mockReturnValue(null),
      findByStatus: vi.fn().mockReturnValue([]),
      findByFiscalYear: vi.fn().mockReturnValue([]),
      findByFiscalPeriod: vi.fn().mockReturnValue([]),
      findByDateRange: vi.fn().mockReturnValue([]),
      findReversals: vi.fn().mockReturnValue([]),
      search: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return {
          _id: 'je-001',
          code: input.code,
          entryDate: input.entryDate,
          fiscalYearId: input.fiscalYearId,
          fiscalPeriodId: input.fiscalPeriodId,
          referenceType: input.referenceType ?? 'manual',
          referenceId: input.referenceId ?? null,
          referenceNumber: input.referenceNumber ?? null,
          description: input.description,
          notes: input.notes ?? null,
          status: input.status ?? 'draft',
          reversalOfId: input.reversalOfId ?? null,
          totalDebit: input.totalDebit ?? 0,
          totalCredit: input.totalCredit ?? 0,
          currency: input.currency ?? 'SAR',
          createdByUserId: input.createdByUserId ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          deletedAt: null,
        }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return {
          _id: id,
          code: 'JE-000001',
          entryDate: new Date(),
          fiscalYearId: 'fy-001',
          fiscalPeriodId: 'period-001',
          referenceType: 'manual',
          description: 'Test Entry',
          status: changes.status ?? 'draft',
          totalDebit: 1000,
          totalCredit: 1000,
          currency: 'SAR',
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          deletedAt: null,
        }
      }),
      softDelete: vi.fn().mockReturnValue(true),
    }
  }),
}))

vi.mock('@/core/repositories/JournalEntryLineRepository', () => ({
  JournalEntryLineRepository: vi.fn().mockImplementation(function () {
    return {
      findByJournalEntry: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return {
          _id: 'line-001',
          journalEntryId: input.journalEntryId,
          accountId: input.accountId,
          debit: input.debit ?? 0,
          credit: input.credit ?? 0,
          currency: 'SAR',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      }),
      deleteByJournalEntry: vi.fn().mockReturnValue(2),
    }
  }),
}))

vi.mock('@/core/repositories/LedgerTransactionRepository', () => ({
  LedgerTransactionRepository: vi.fn().mockImplementation(function () {
    return {
      findByAccount: vi.fn().mockReturnValue([]),
      findByFiscalPeriod: vi.fn().mockReturnValue([]),
      findLastByAccount: vi.fn().mockReturnValue(null),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return { _id: 'led-001', ...input, createdAt: new Date(), updatedAt: new Date() }
      }),
    }
  }),
}))

vi.mock('@/core/repositories/AccountRepository', () => ({
  AccountRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findActive: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockReturnValue(mockAccount),
      findByCode: vi.fn().mockReturnValue(mockAccount),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return { _id: id, ...changes, updatedAt: new Date() }
      }),
      updateBalance: vi.fn(),
    }
  }),
}))

vi.mock('@/core/repositories/FiscalPeriodRepository', () => ({
  FiscalPeriodRepository: vi.fn().mockImplementation(function () {
    return {
      findById: vi.fn().mockReturnValue(mockPeriod),
      findByDate: vi.fn().mockReturnValue(mockPeriod),
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

  describe('createDraftEntry', () => {
    it('creates a balanced journal entry with 2 lines', () => {
      const result = service.createDraftEntry(
        {
          entryDate: new Date('2026-01-15'),
          fiscalYearId: 'fy-001',
          fiscalPeriodId: 'period-001',
          description: 'Test Journal Entry',
          lines: [
            { accountId: 'acc-001', debit: 1000, credit: 0 },
            { accountId: 'acc-002', debit: 0, credit: 1000 },
          ],
        },
        'user-1',
        'admin',
      )
      expect(result._id).toBe('je-001')
      expect(result.description).toBe('Test Journal Entry')
    })

    it('throws when entry has fewer than 2 lines', () => {
      expect(() =>
        service.createDraftEntry({
          entryDate: new Date(),
          fiscalYearId: 'fy-001',
          fiscalPeriodId: 'period-001',
          description: 'Single line',
          lines: [{ accountId: 'acc-001', debit: 1000, credit: 0 }],
        }),
      ).toThrow('at least 2 lines')
    })

    it('throws when debit/credit mismatch', () => {
      expect(() =>
        service.createDraftEntry({
          entryDate: new Date(),
          fiscalYearId: 'fy-001',
          fiscalPeriodId: 'period-001',
          description: 'Unbalanced',
          lines: [
            { accountId: 'acc-001', debit: 1000, credit: 0 },
            { accountId: 'acc-002', debit: 0, credit: 500 },
          ],
        }),
      ).toThrow('Debit/Credit mismatch')
    })

    it('throws when line has both debit and credit', () => {
      expect(() =>
        service.createDraftEntry({
          entryDate: new Date(),
          fiscalYearId: 'fy-001',
          fiscalPeriodId: 'period-001',
          description: 'Invalid line',
          lines: [
            { accountId: 'acc-001', debit: 1000, credit: 500 },
            { accountId: 'acc-002', debit: 0, credit: 1000 },
          ],
        }),
      ).toThrow('both debit and credit')
    })

    it('throws when line has zero amounts', () => {
      expect(() =>
        service.createDraftEntry({
          entryDate: new Date(),
          fiscalYearId: 'fy-001',
          fiscalPeriodId: 'period-001',
          description: 'Zero line',
          lines: [
            { accountId: 'acc-001', debit: 0, credit: 0 },
            { accountId: 'acc-002', debit: 0, credit: 0 },
          ],
        }),
      ).toThrow('must have either')
    })

    it('throws when fiscal period is not open', () => {
      const periodRepo = service['periodRepo']
      periodRepo.findById = vi.fn().mockReturnValue({ _id: 'p1', status: 'closed' })

      expect(() =>
        service.createDraftEntry({
          entryDate: new Date(),
          fiscalYearId: 'fy-001',
          fiscalPeriodId: 'p1',
          description: 'Closed period',
          lines: [
            { accountId: 'acc-001', debit: 100, credit: 0 },
            { accountId: 'acc-002', debit: 0, credit: 100 },
          ],
        }),
      ).toThrow('not open')
    })
  })

  describe('reviewEntry', () => {
    it('reviews a draft entry', () => {
      const entryRepo = service['entryRepo']
      entryRepo.findById = vi.fn().mockReturnValue({
        _id: 'je-001',
        code: 'JE-000001',
        status: 'draft',
      })
      const lineRepo = service['lineRepo']
      lineRepo.findByJournalEntry = vi.fn().mockReturnValue([
        { accountId: 'acc-001', debit: 1000, credit: 0 },
        { accountId: 'acc-002', debit: 0, credit: 1000 },
      ])

      const result = service.reviewEntry('je-001', 'user-1', 'admin')
      expect(result.status).toBe('reviewed')
    })

    it('throws when entry is not draft', () => {
      const entryRepo = service['entryRepo']
      entryRepo.findById = vi.fn().mockReturnValue({
        _id: 'je-001',
        status: 'posted',
      })
      expect(() => service.reviewEntry('je-001')).toThrow('Only draft entries')
    })
  })

  describe('approveEntry', () => {
    it('approves a reviewed entry', () => {
      const entryRepo = service['entryRepo']
      entryRepo.findById = vi.fn().mockReturnValue({
        _id: 'je-001',
        code: 'JE-000001',
        status: 'reviewed',
      })
      const result = service.approveEntry('je-001', 'user-1', 'admin')
      expect(result.status).toBe('approved')
    })

    it('throws when entry is not reviewed', () => {
      const entryRepo = service['entryRepo']
      entryRepo.findById = vi.fn().mockReturnValue({
        _id: 'je-001',
        status: 'draft',
      })
      expect(() => service.approveEntry('je-001')).toThrow('Only reviewed entries')
    })
  })

  describe('postEntry', () => {
    it('posts an approved entry and creates ledger transactions', () => {
      const entryRepo = service['entryRepo']
      const postedRecord = {
        _id: 'je-001',
        code: 'JE-000001',
        status: 'posted',
        entryDate: new Date(),
        fiscalYearId: 'fy-001',
        fiscalPeriodId: 'period-001',
        referenceType: 'manual',
        referenceId: null,
        referenceNumber: null,
        description: 'Test',
      }
      entryRepo.findById = vi.fn()
        .mockReturnValueOnce({
          _id: 'je-001',
          code: 'JE-000001',
          status: 'approved',
          entryDate: new Date(),
          fiscalYearId: 'fy-001',
          fiscalPeriodId: 'period-001',
          referenceType: 'manual',
          referenceId: null,
          referenceNumber: null,
          description: 'Test',
        })
        .mockReturnValueOnce(postedRecord)
      const lineRepo = service['lineRepo']
      lineRepo.findByJournalEntry = vi.fn().mockReturnValue([
        { _id: 'l1', accountId: 'acc-001', debit: 1000, credit: 0, currency: 'SAR', description: null, costCenterId: null, customerId: null, supplierId: null },
        { _id: 'l2', accountId: 'acc-002', debit: 0, credit: 1000, currency: 'SAR', description: null, costCenterId: null, customerId: null, supplierId: null },
      ])

      const result = service.postEntry('je-001', 'user-1', 'admin')
      expect(result?.status).toBe('posted')
    })

    it('throws when entry is not approved', () => {
      const entryRepo = service['entryRepo']
      entryRepo.findById = vi.fn().mockReturnValue({
        _id: 'je-001',
        status: 'draft',
      })
      expect(() => service.postEntry('je-001')).toThrow('Only approved entries')
    })
  })

  describe('deleteDraftEntry', () => {
    it('deletes a draft entry', () => {
      const entryRepo = service['entryRepo']
      entryRepo.findById = vi.fn().mockReturnValue({
        _id: 'je-001',
        code: 'JE-000001',
        status: 'draft',
      })
      expect(service.deleteDraftEntry('je-001')).toBe(true)
    })

    it('throws when entry is not draft', () => {
      const entryRepo = service['entryRepo']
      entryRepo.findById = vi.fn().mockReturnValue({
        _id: 'je-001',
        status: 'posted',
      })
      expect(() => service.deleteDraftEntry('je-001')).toThrow('Only draft entries')
    })
  })
})
