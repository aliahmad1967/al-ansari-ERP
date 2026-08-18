import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AssetService } from '@/modules/assets/services/AssetService'

const mockCategory = {
  _id: 'cat-001',
  code: 'IT-EQ',
  name: 'IT Equipment',
  nameAr: 'معدات تكنولوجيا المعلومات',
  defaultUsefulLifeMonths: 60,
  defaultDepreciationMethod: 'straight_line',
  expenseAccountId: 'acc-001',
  accumulatedDepreciationAccountId: 'acc-002',
}

const mockAsset = {
  _id: 'ast-001',
  code: 'AST-000001',
  name: 'Laptop',
  nameAr: 'حاسوب محمول',
  description: 'Developer laptop',
  categoryId: 'cat-001',
  locationId: 'loc-001',
  custodianId: 'cust-001',
  purchaseValue: 5000,
  salvageValue: 500,
  usefulLifeMonths: 60,
  depreciationMethod: 'straight_line',
  acquisitionDate: new Date('2026-01-15'),
  disposalDate: null,
  status: 'active',
  serialNumber: 'SN-001',
  model: 'ThinkPad X1',
  manufacturer: 'Lenovo',
  journalEntryId: null,
  lastDepreciationDate: null,
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
      findByCode: vi.fn().mockReturnValue(null),
      findByCategory: vi.fn().mockReturnValue([]),
      findByStatus: vi.fn().mockReturnValue([]),
      search: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return {
          _id: 'ast-001',
          code: input.code,
          name: input.name,
          nameAr: input.nameAr,
          description: input.description ?? null,
          categoryId: input.categoryId,
          locationId: input.locationId ?? null,
          custodianId: input.custodianId ?? null,
          purchaseValue: input.purchaseValue ?? 0,
          salvageValue: input.salvageValue ?? 0,
          usefulLifeMonths: input.usefulLifeMonths ?? 60,
          depreciationMethod: input.depreciationMethod ?? 'straight_line',
          acquisitionDate: input.acquisitionDate ?? new Date(),
          disposalDate: null,
          status: input.status ?? 'active',
          serialNumber: input.serialNumber ?? null,
          model: input.model ?? null,
          manufacturer: input.manufacturer ?? null,
          journalEntryId: null,
          lastDepreciationDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          deletedAt: null,
        }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return {
          _id: id,
          code: 'AST-000001',
          name: changes.name ?? 'Laptop',
          nameAr: changes.nameAr ?? 'حاسوب محمول',
          categoryId: 'cat-001',
          purchaseValue: 5000,
          salvageValue: 500,
          usefulLifeMonths: 60,
          depreciationMethod: 'straight_line',
          acquisitionDate: new Date(),
          status: changes.status ?? 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          deletedAt: null,
        }
      }),
      softDelete: vi.fn().mockReturnValue(true),
      restore: vi.fn().mockReturnValue(true),
      findByIdIncludingDeleted: vi.fn().mockReturnValue(null),
    }
  }),
}))

vi.mock('@/core/repositories/AssetCategoryRepository', () => ({
  AssetCategoryRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockReturnValue(mockCategory),
      findByCode: vi.fn().mockReturnValue(mockCategory),
    }
  }),
}))

vi.mock('@/core/repositories/AuditRepository', () => ({
  AuditRepository: vi.fn().mockImplementation(function () {
    return { create: vi.fn() }
  }),
}))

describe('AssetService', () => {
  let service: AssetService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new AssetService()
  })

  describe('createAsset', () => {
    it('creates an asset with auto-numbering', () => {
      const assetRepo = service['assetRepo']
      assetRepo.findAll = vi.fn().mockReturnValue([{ _id: 'ast-001' }, { _id: 'ast-002' }])

      const result = service.createAsset({
        name: 'Laptop',
        nameAr: 'حاسوب محمول',
        categoryId: 'cat-001',
        purchaseValue: 5000,
        usefulLifeMonths: 60,
        acquisitionDate: new Date('2026-01-15'),
      })
      expect(result._id).toBe('ast-001')
      expect(assetRepo.create).toHaveBeenCalled()
    })

    it('creates an asset with custom code', () => {
      const result = service.createAsset({
        code: 'CUSTOM-001',
        name: 'Laptop',
        nameAr: 'حاسوب محمول',
        categoryId: 'cat-001',
        purchaseValue: 5000,
        usefulLifeMonths: 60,
        acquisitionDate: new Date('2026-01-15'),
      })
      expect(result.code).toBe('CUSTOM-001')
    })

    it('throws when category not found', () => {
      const categoryRepo = service['categoryRepo']
      categoryRepo.findById = vi.fn().mockReturnValue(null)

      expect(() =>
        service.createAsset({
          name: 'Laptop',
          nameAr: 'حاسوب محمول',
          categoryId: 'nonexistent',
          purchaseValue: 5000,
          usefulLifeMonths: 60,
          acquisitionDate: new Date('2026-01-15'),
        }),
      ).toThrow('Asset category not found')
    })

    it('applies category defaults for depreciation method and useful life', () => {
      const categoryRepo = service['categoryRepo']
      categoryRepo.findById = vi.fn().mockReturnValue({
        ...mockCategory,
        defaultDepreciationMethod: 'declining_balance',
        defaultUsefulLifeMonths: 84,
      })

      const assetRepo = service['assetRepo']
      assetRepo.create = vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return {
          _id: 'ast-001',
          code: input.code,
          depreciationMethod: input.depreciationMethod,
          usefulLifeMonths: input.usefulLifeMonths,
        }
      })

      const result = service.createAsset({
        name: 'Laptop',
        nameAr: 'حاسوب محمول',
        categoryId: 'cat-001',
        purchaseValue: 5000,
        acquisitionDate: new Date('2026-01-15'),
      })
      expect(result.depreciationMethod).toBe('declining_balance')
      expect(result.usefulLifeMonths).toBe(84)
    })
  })

  describe('updateAsset', () => {
    it('updates asset properties', () => {
      const assetRepo = service['assetRepo']
      assetRepo.findById = vi.fn().mockReturnValue(mockAsset)

      service.updateAsset('ast-001', { name: 'New Laptop' })
      expect(assetRepo.update).toHaveBeenCalledWith('ast-001', { name: 'New Laptop' })
    })

    it('throws when asset not found', () => {
      const assetRepo = service['assetRepo']
      assetRepo.findById = vi.fn().mockReturnValue(null)

      expect(() => service.updateAsset('nonexistent', { name: 'X' })).toThrow('Asset not found')
    })
  })

  describe('updateAssetStatus', () => {
    it('transitions asset status (valid transitions)', () => {
      const assetRepo = service['assetRepo']
      assetRepo.findById = vi.fn().mockReturnValue({ ...mockAsset, status: 'active' })

      service.updateAssetStatus('ast-001', 'inactive')
      expect(assetRepo.update).toHaveBeenCalledWith('ast-001', { status: 'inactive' })
    })

    it('rejects invalid status transitions', () => {
      const assetRepo = service['assetRepo']
      assetRepo.findById = vi.fn().mockReturnValue({ ...mockAsset, status: 'disposed' })

      expect(() => service.updateAssetStatus('ast-001', 'active')).toThrow(
        'Cannot transition from "disposed" to "active"',
      )
    })

    it('throws when asset not found', () => {
      const assetRepo = service['assetRepo']
      assetRepo.findById = vi.fn().mockReturnValue(null)

      expect(() => service.updateAssetStatus('nonexistent', 'inactive')).toThrow('Asset not found')
    })
  })

  describe('archiveAsset', () => {
    it('archives (soft deletes) an asset', () => {
      const assetRepo = service['assetRepo']
      assetRepo.findById = vi.fn().mockReturnValue(mockAsset)

      const result = service.archiveAsset('ast-001')
      expect(result).toBe(true)
      expect(assetRepo.softDelete).toHaveBeenCalledWith('ast-001')
    })

    it('throws when asset not found', () => {
      const assetRepo = service['assetRepo']
      assetRepo.findById = vi.fn().mockReturnValue(null)

      expect(() => service.archiveAsset('nonexistent')).toThrow('Asset not found')
    })
  })

  describe('restoreAsset', () => {
    it('restores a soft-deleted asset', () => {
      const assetRepo = service['assetRepo']
      assetRepo.findByIdIncludingDeleted = vi.fn().mockReturnValue({ ...mockAsset, isDeleted: true })

      const result = service.restoreAsset('ast-001')
      expect(result).toBe(true)
      expect(assetRepo.restore).toHaveBeenCalledWith('ast-001')
    })

    it('throws when asset not found', () => {
      const assetRepo = service['assetRepo']
      assetRepo.findByIdIncludingDeleted = vi.fn().mockReturnValue(null)

      expect(() => service.restoreAsset('nonexistent')).toThrow('Asset not found')
    })
  })

  describe('getNextAssetCode', () => {
    it('generates correct asset code sequence', () => {
      const assetRepo = service['assetRepo']
      assetRepo.findAll = vi.fn().mockReturnValue([
        { _id: 'a1' },
        { _id: 'a2' },
        { _id: 'a3' },
      ])

      const code = service.getNextAssetCode()
      expect(code).toBe('AST-000004')
    })
  })
})
