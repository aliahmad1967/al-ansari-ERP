import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AssetDisposalService } from '@/modules/assets/services/AssetDisposalService'

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

const mockDisposal = {
  _id: 'disp-001',
  assetId: 'ast-001',
  disposalDate: new Date('2026-06-15'),
  disposalMethod: 'sale',
  disposalValue: 3000,
  gainLoss: -3000,
  reason: 'End of useful life',
  status: 'pending',
  journalEntryId: null,
  approvedBy: null,
  approvedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
  deletedAt: null,
}

vi.mock('@/core/repositories/AssetDisposalRepository', () => ({
  AssetDisposalRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockReturnValue(null),
      findByAsset: vi.fn().mockReturnValue([]),
      findByStatus: vi.fn().mockReturnValue([]),
      search: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return {
          _id: 'disp-001',
          assetId: input.assetId,
          disposalDate: input.disposalDate,
          disposalMethod: input.disposalMethod,
          disposalValue: input.disposalValue ?? 0,
          gainLoss: input.gainLoss ?? 0,
          reason: input.reason,
          status: input.status ?? 'pending',
          journalEntryId: null,
          approvedBy: null,
          approvedAt: null,
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
          disposalDate: new Date(),
          disposalMethod: 'sale',
          disposalValue: 3000,
          gainLoss: -3000,
          reason: 'End of useful life',
          status: changes.status ?? 'pending',
          approvedBy: changes.approvedBy ?? null,
          approvedAt: changes.approvedAt ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          deletedAt: null,
        }
      }),
    }
  }),
}))

vi.mock('@/core/repositories/AssetRepository', () => ({
  AssetRepository: vi.fn().mockImplementation(function () {
    return {
      findById: vi.fn().mockReturnValue(null),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return { _id: id, ...changes, updatedAt: new Date() }
      }),
    }
  }),
}))

vi.mock('@/core/repositories/DepreciationScheduleRepository', () => ({
  DepreciationScheduleRepository: vi.fn().mockImplementation(function () {
    return {
      findByAsset: vi.fn().mockReturnValue([]),
    }
  }),
}))

vi.mock('@/core/repositories/AuditRepository', () => ({
  AuditRepository: vi.fn().mockImplementation(function () {
    return { create: vi.fn() }
  }),
}))

describe('AssetDisposalService', () => {
  let service: AssetDisposalService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new AssetDisposalService()
  })

  describe('createDisposal', () => {
    it('creates a disposal request with gain/loss calculation', () => {
      const assetRepo = service['assetRepo']
      assetRepo.findById = vi.fn().mockReturnValue(mockAsset)
      const scheduleRepo = service['scheduleRepo']
      scheduleRepo.findByAsset = vi.fn().mockReturnValue([
        { status: 'finalized', depreciationAmount: 5000 },
        { status: 'finalized', depreciationAmount: 2000 },
      ])

      const result = service.createDisposal(
        {
          assetId: 'ast-001',
          disposalDate: new Date('2026-06-15'),
          disposalMethod: 'sale',
          disposalValue: 3000,
          reason: 'End of useful life',
        },
        'user-1',
        'admin',
      )
      expect(result._id).toBe('disp-001')
      expect(result.status).toBe('pending')
      expect(result.gainLoss).toBeDefined()
    })

    it('rejects disposal for already-disposed asset', () => {
      const assetRepo = service['assetRepo']
      assetRepo.findById = vi.fn().mockReturnValue({ ...mockAsset, status: 'disposed' })

      expect(() =>
        service.createDisposal({
          assetId: 'ast-001',
          disposalDate: new Date(),
          disposalMethod: 'sale',
          reason: 'Scrap',
        }),
      ).toThrow('Asset is already disposed')
    })

    it('throws when asset not found', () => {
      const assetRepo = service['assetRepo']
      assetRepo.findById = vi.fn().mockReturnValue(null)

      expect(() =>
        service.createDisposal({
          assetId: 'nonexistent',
          disposalDate: new Date(),
          disposalMethod: 'sale',
          reason: 'Scrap',
        }),
      ).toThrow('Asset not found')
    })
  })

  describe('approveDisposal', () => {
    it('approves a pending disposal', () => {
      const disposalRepo = service['disposalRepo']
      disposalRepo.findById = vi.fn().mockReturnValue({ ...mockDisposal, status: 'pending' })

      const result = service.approveDisposal('disp-001', 'approver-1', 'manager')
      expect(result.status).toBe('approved')
    })

    it('rejects approval of non-pending disposal', () => {
      const disposalRepo = service['disposalRepo']
      disposalRepo.findById = vi.fn().mockReturnValue({ ...mockDisposal, status: 'approved' })

      expect(() => service.approveDisposal('disp-001', 'approver-1', 'manager')).toThrow(
        'Only pending disposals can be approved',
      )
    })

    it('throws when disposal not found', () => {
      const disposalRepo = service['disposalRepo']
      disposalRepo.findById = vi.fn().mockReturnValue(null)

      expect(() => service.approveDisposal('nonexistent', 'user-1', 'admin')).toThrow(
        'Disposal not found',
      )
    })
  })

  describe('completeDisposal', () => {
    it('completes disposal (marks asset as disposed)', () => {
      const disposalRepo = service['disposalRepo']
      disposalRepo.findById = vi.fn().mockReturnValue({ ...mockDisposal, status: 'approved' })
      const assetRepo = service['assetRepo']

      const result = service.completeDisposal('disp-001')
      expect(result.status).toBe('completed')
      expect(assetRepo.update).toHaveBeenCalledWith('ast-001', {
        status: 'disposed',
        disposalDate: mockDisposal.disposalDate,
      })
    })

    it('rejects completion of non-approved disposal', () => {
      const disposalRepo = service['disposalRepo']
      disposalRepo.findById = vi.fn().mockReturnValue({ ...mockDisposal, status: 'pending' })

      expect(() => service.completeDisposal('disp-001')).toThrow(
        'Only approved disposals can be completed',
      )
    })

    it('throws when disposal not found', () => {
      const disposalRepo = service['disposalRepo']
      disposalRepo.findById = vi.fn().mockReturnValue(null)

      expect(() => service.completeDisposal('nonexistent')).toThrow('Disposal not found')
    })
  })

  describe('getBookValue', () => {
    it('calculates book value correctly', () => {
      const assetRepo = service['assetRepo']
      assetRepo.findById = vi.fn().mockReturnValue(mockAsset)
      const scheduleRepo = service['scheduleRepo']
      scheduleRepo.findByAsset = vi.fn().mockReturnValue([
        { status: 'finalized', depreciationAmount: 5000 },
        { status: 'finalized', depreciationAmount: 2000 },
        { status: 'draft', depreciationAmount: 1000 },
      ])

      const result = service.getBookValue('ast-001')
      expect(result).toBe(5000)
    })

    it('throws when asset not found', () => {
      const assetRepo = service['assetRepo']
      assetRepo.findById = vi.fn().mockReturnValue(null)

      expect(() => service.getBookValue('nonexistent')).toThrow('Asset not found')
    })
  })
})
