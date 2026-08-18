import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DepreciationService } from '@/modules/assets/services/DepreciationService'

const mockAsset = {
  _id: 'ast-001',
  code: 'AST-000001',
  name: 'Laptop',
  nameAr: 'حاسوب محمول',
  categoryId: 'cat-001',
  purchaseValue: 12000,
  salvageValue: 2000,
  usefulLifeMonths: 60,
  depreciationMethod: 'straight_line',
  acquisitionDate: new Date('2026-01-01'),
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
  deletedAt: null,
}

const mockSchedule = {
  _id: 'dep-001',
  assetId: 'ast-001',
  periodStart: new Date('2026-01-01'),
  periodEnd: new Date('2026-01-31'),
  depreciationAmount: 166.67,
  accumulatedDepreciation: 166.67,
  bookValue: 11833.33,
  status: 'draft',
  journalEntryId: null,
  finalizedAt: null,
  finalizedByUserId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
  deletedAt: null,
}

vi.mock('@/core/repositories/AssetRepository', () => ({
  AssetRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockReturnValue(null),
      findByStatus: vi.fn().mockReturnValue([]),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return { _id: id, ...changes, updatedAt: new Date() }
      }),
    }
  }),
}))

vi.mock('@/core/repositories/DepreciationScheduleRepository', () => ({
  DepreciationScheduleRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockReturnValue(null),
      findByAsset: vi.fn().mockReturnValue([]),
      findByStatus: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return {
          _id: 'dep-001',
          assetId: input.assetId,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          depreciationAmount: input.depreciationAmount ?? 0,
          accumulatedDepreciation: input.accumulatedDepreciation ?? 0,
          bookValue: input.bookValue ?? 0,
          status: input.status ?? 'draft',
          journalEntryId: null,
          finalizedAt: null,
          finalizedByUserId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          deletedAt: null,
        }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return {
          _id: id,
          assetId: 'ast-001',
          status: changes.status ?? 'draft',
          finalizedAt: changes.finalizedAt ?? null,
          finalizedByUserId: changes.finalizedByUserId ?? null,
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

describe('DepreciationService', () => {
  let service: DepreciationService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new DepreciationService()
  })

  describe('calculatePeriodDepreciation', () => {
    it('calculates straight-line depreciation correctly', () => {
      const result = service.calculatePeriodDepreciation(12000, 2000, 60, 'straight_line', 0)
      expect(result).toBeCloseTo(166.67, 1)
    })

    it('calculates declining balance depreciation correctly', () => {
      const result = service.calculatePeriodDepreciation(12000, 2000, 60, 'declining_balance', 0)
      expect(result).toBeGreaterThan(0)
    })

    it('calculates sum-of-years-digits depreciation correctly', () => {
      const result = service.calculatePeriodDepreciation(12000, 2000, 60, 'sum_of_years_digits', 0)
      expect(result).toBeGreaterThan(0)
    })
  })

  describe('generateSchedule', () => {
    it('generates depreciation schedule for an asset', () => {
      const assetRepo = service['assetRepo']
      assetRepo.findById = vi.fn().mockReturnValue(mockAsset)

      const result = service.generateSchedule('ast-001')
      expect(result.length).toBe(60)
      expect(result[0].assetId).toBe('ast-001')
    })

    it('rejects schedule generation for non-active assets', () => {
      const assetRepo = service['assetRepo']
      assetRepo.findById = vi.fn().mockReturnValue({ ...mockAsset, status: 'disposed' })

      expect(() => service.generateSchedule('ast-001')).toThrow(
        'Can only generate schedule for active assets',
      )
    })

    it('rejects schedule generation when schedule already exists', () => {
      const assetRepo = service['assetRepo']
      assetRepo.findById = vi.fn().mockReturnValue(mockAsset)
      const scheduleRepo = service['scheduleRepo']
      scheduleRepo.findByAsset = vi.fn().mockReturnValue([mockSchedule])

      expect(() => service.generateSchedule('ast-001')).toThrow(
        'Depreciation schedule already exists for this asset',
      )
    })

    it('throws when asset not found', () => {
      const assetRepo = service['assetRepo']
      assetRepo.findById = vi.fn().mockReturnValue(null)

      expect(() => service.generateSchedule('nonexistent')).toThrow('Asset not found')
    })
  })

  describe('finalizeSchedule', () => {
    it('finalizes a draft schedule', () => {
      const scheduleRepo = service['scheduleRepo']
      scheduleRepo.findById = vi.fn().mockReturnValue({ ...mockSchedule, status: 'draft' })

      const result = service.finalizeSchedule('dep-001', 'user-1', 'admin')
      expect(result.status).toBe('finalized')
    })

    it('rejects finalization of non-draft schedules', () => {
      const scheduleRepo = service['scheduleRepo']
      scheduleRepo.findById = vi.fn().mockReturnValue({ ...mockSchedule, status: 'finalized' })

      expect(() => service.finalizeSchedule('dep-001')).toThrow(
        'Only draft schedules can be finalized',
      )
    })

    it('throws when schedule not found', () => {
      const scheduleRepo = service['scheduleRepo']
      scheduleRepo.findById = vi.fn().mockReturnValue(null)

      expect(() => service.finalizeSchedule('nonexistent')).toThrow(
        'Depreciation schedule not found',
      )
    })
  })

  describe('reverseSchedule', () => {
    it('reverses a finalized schedule', () => {
      const scheduleRepo = service['scheduleRepo']
      scheduleRepo.findById = vi.fn().mockReturnValue({ ...mockSchedule, status: 'finalized' })

      const result = service.reverseSchedule('dep-001')
      expect(result.status).toBe('reversed')
    })

    it('rejects reversal of non-finalized schedules', () => {
      const scheduleRepo = service['scheduleRepo']
      scheduleRepo.findById = vi.fn().mockReturnValue({ ...mockSchedule, status: 'draft' })

      expect(() => service.reverseSchedule('dep-001')).toThrow(
        'Only finalized schedules can be reversed',
      )
    })

    it('throws when schedule not found', () => {
      const scheduleRepo = service['scheduleRepo']
      scheduleRepo.findById = vi.fn().mockReturnValue(null)

      expect(() => service.reverseSchedule('nonexistent')).toThrow(
        'Depreciation schedule not found',
      )
    })
  })
})
