import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FiscalYearService } from '@/modules/accounting/services/FiscalYearService'

vi.mock('@/core/repositories/FiscalYearRepository', () => ({
  FiscalYearRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockReturnValue(null),
      findByCode: vi.fn().mockReturnValue(null),
      findOpen: vi.fn().mockReturnValue([]),
      findByDateRange: vi.fn().mockReturnValue([]),
      search: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return {
          _id: 'fy-001',
          code: input.code,
          name: input.name,
          nameAr: input.nameAr ?? null,
          startDate: input.startDate,
          endDate: input.endDate,
          status: input.status ?? 'draft',
          isClosed: input.isClosed ?? false,
          notes: input.notes ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          deletedAt: null,
        }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return {
          _id: id,
          code: 'FY-2026',
          name: '2026',
          status: changes.status ?? 'open',
          isClosed: changes.isClosed ?? false,
          closedAt: changes.closedAt ?? null,
          closedByUserId: changes.closedByUserId ?? null,
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

vi.mock('@/core/repositories/FiscalPeriodRepository', () => ({
  FiscalPeriodRepository: vi.fn().mockImplementation(function () {
    return {
      findByFiscalYear: vi.fn().mockReturnValue([]),
      findOpenByFiscalYear: vi.fn().mockReturnValue([]),
      findByDate: vi.fn().mockReturnValue(null),
      search: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return {
          _id: 'period-001',
          fiscalYearId: input.fiscalYearId,
          code: input.code,
          name: input.name,
          startDate: input.startDate,
          endDate: input.endDate,
          status: input.status ?? 'draft',
          isClosed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          deletedAt: null,
        }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return { _id: id, status: changes.status ?? 'open', isClosed: false, createdAt: new Date(), updatedAt: new Date(), isDeleted: false, deletedAt: null }
      }),
    }
  }),
}))

vi.mock('@/core/repositories/JournalEntryRepository', () => ({
  JournalEntryRepository: vi.fn().mockImplementation(function () {
    return {
      findByFiscalYear: vi.fn().mockReturnValue([]),
    }
  }),
}))

vi.mock('@/core/repositories/AuditRepository', () => ({
  AuditRepository: vi.fn().mockImplementation(function () {
    return { create: vi.fn() }
  }),
}))

describe('FiscalYearService', () => {
  let service: FiscalYearService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new FiscalYearService()
  })

  describe('createYear', () => {
    it('creates a fiscal year', () => {
      const result = service.createYear(
        {
          code: 'FY-2026',
          name: '2026',
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-12-31'),
        },
        'user-1',
        'admin',
      )
      expect(result._id).toBe('fy-001')
      expect(result.code).toBe('FY-2026')
    })

    it('throws on duplicate code', () => {
      const repo = service['yearRepo']
      repo.findByCode = vi.fn().mockReturnValue({ _id: 'existing' })
      expect(() =>
        service.createYear({
          code: 'FY-2026',
          name: '2026',
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-12-31'),
        }),
      ).toThrow('already exists')
    })

    it('throws when start date is after end date', () => {
      expect(() =>
        service.createYear({
          code: 'FY-2026',
          name: '2026',
          startDate: new Date('2026-12-31'),
          endDate: new Date('2026-01-01'),
        }),
      ).toThrow('Start date must be before')
    })

    it('creates monthly periods by default', () => {
      service.createYear({
        code: 'FY-2026',
        name: '2026',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        createPeriods: true,
        periodType: 'monthly',
      })
      const periodRepo = service['periodRepo']
      expect(periodRepo.create).toHaveBeenCalledTimes(12)
    })

    it('creates quarterly periods when specified', () => {
      service.createYear({
        code: 'FY-2026',
        name: '2026',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        createPeriods: true,
        periodType: 'quarterly',
      })
      const periodRepo = service['periodRepo']
      expect(periodRepo.create).toHaveBeenCalledTimes(4)
    })
  })

  describe('openYear', () => {
    it('opens a draft fiscal year', () => {
      const repo = service['yearRepo']
      repo.findById = vi.fn().mockReturnValue({
        _id: 'fy-001',
        code: 'FY-2026',
        status: 'draft',
      })
      const result = service.openYear('fy-001', 'user-1', 'admin')
      expect(result.status).toBe('open')
    })

    it('throws when year is not draft', () => {
      const repo = service['yearRepo']
      repo.findById = vi.fn().mockReturnValue({
        _id: 'fy-001',
        status: 'closed',
      })
      expect(() => service.openYear('fy-001')).toThrow('Only draft')
    })
  })

  describe('closeYear', () => {
    it('closes an open fiscal year', () => {
      const repo = service['yearRepo']
      const closedRecord = {
        _id: 'fy-001',
        code: 'FY-2026',
        status: 'closed',
        isClosed: true,
        closedAt: new Date(),
        closedByUserId: 'user-1',
      }
      repo.findById = vi.fn()
        .mockReturnValueOnce({ _id: 'fy-001', code: 'FY-2026', status: 'open' })
        .mockReturnValueOnce(closedRecord)
      const result = service.closeYear('fy-001', 'user-1', 'admin')
      expect(result?.isClosed).toBe(true)
    })

    it('throws when year is not open', () => {
      const repo = service['yearRepo']
      repo.findById = vi.fn().mockReturnValue({
        _id: 'fy-001',
        status: 'draft',
      })
      expect(() => service.closeYear('fy-001')).toThrow('Only open')
    })

    it('throws when year has open periods', () => {
      const repo = service['yearRepo']
      repo.findById = vi.fn().mockReturnValue({
        _id: 'fy-001',
        status: 'open',
      })
      const periodRepo = service['periodRepo']
      periodRepo.findByFiscalYear = vi.fn().mockReturnValue([
        { status: 'open' },
      ])
      expect(() => service.closeYear('fy-001')).toThrow('open periods')
    })
  })
})
