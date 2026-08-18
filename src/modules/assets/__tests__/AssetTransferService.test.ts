import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AssetTransferService } from '@/modules/assets/services/AssetTransferService'

const mockAsset = {
  _id: 'ast-001',
  code: 'AST-000001',
  name: 'Laptop',
  nameAr: 'حاسوب محمول',
  categoryId: 'cat-001',
  locationId: 'loc-001',
  custodianId: 'cust-001',
  purchaseValue: 5000,
  salvageValue: 500,
  usefulLifeMonths: 60,
  depreciationMethod: 'straight_line',
  acquisitionDate: new Date('2026-01-15'),
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
  deletedAt: null,
}

const mockTransfer = {
  _id: 'trf-001',
  assetId: 'ast-001',
  fromLocationId: 'loc-001',
  toLocationId: 'loc-002',
  fromCustodianId: 'cust-001',
  toCustodianId: 'cust-002',
  transferDate: new Date('2026-03-01'),
  reason: 'Department relocation',
  status: 'pending',
  approvedBy: null,
  approvedAt: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
  deletedAt: null,
}

vi.mock('@/core/repositories/AssetTransferRepository', () => ({
  AssetTransferRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockReturnValue(null),
      findByAsset: vi.fn().mockReturnValue([]),
      findByStatus: vi.fn().mockReturnValue([]),
      search: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return {
          _id: 'trf-001',
          assetId: input.assetId,
          fromLocationId: input.fromLocationId ?? null,
          toLocationId: input.toLocationId ?? null,
          fromCustodianId: input.fromCustodianId ?? null,
          toCustodianId: input.toCustodianId ?? null,
          transferDate: input.transferDate,
          reason: input.reason,
          status: input.status ?? 'pending',
          approvedBy: null,
          approvedAt: null,
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
          assetId: 'ast-001',
          fromLocationId: 'loc-001',
          toLocationId: 'loc-002',
          fromCustodianId: 'cust-001',
          toCustodianId: 'cust-002',
          transferDate: new Date(),
          reason: 'Department relocation',
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

vi.mock('@/core/repositories/AuditRepository', () => ({
  AuditRepository: vi.fn().mockImplementation(function () {
    return { create: vi.fn() }
  }),
}))

describe('AssetTransferService', () => {
  let service: AssetTransferService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new AssetTransferService()
  })

  describe('createTransfer', () => {
    it('creates a transfer request', () => {
      const assetRepo = service['assetRepo']
      assetRepo.findById = vi.fn().mockReturnValue(mockAsset)

      const result = service.createTransfer(
        {
          assetId: 'ast-001',
          toLocationId: 'loc-002',
          toCustodianId: 'cust-002',
          transferDate: new Date('2026-03-01'),
          reason: 'Department relocation',
        },
        'user-1',
        'admin',
      )
      expect(result._id).toBe('trf-001')
      expect(result.status).toBe('pending')
    })

    it('rejects transfer for disposed asset', () => {
      const assetRepo = service['assetRepo']
      assetRepo.findById = vi.fn().mockReturnValue({ ...mockAsset, status: 'disposed' })

      expect(() =>
        service.createTransfer({
          assetId: 'ast-001',
          transferDate: new Date(),
          reason: 'Move',
        }),
      ).toThrow('Cannot transfer a disposed asset')
    })

    it('throws when asset not found', () => {
      const assetRepo = service['assetRepo']
      assetRepo.findById = vi.fn().mockReturnValue(null)

      expect(() =>
        service.createTransfer({
          assetId: 'nonexistent',
          transferDate: new Date(),
          reason: 'Move',
        }),
      ).toThrow('Asset not found')
    })
  })

  describe('approveTransfer', () => {
    it('approves a pending transfer', () => {
      const transferRepo = service['transferRepo']
      transferRepo.findById = vi.fn().mockReturnValue({ ...mockTransfer, status: 'pending' })

      const result = service.approveTransfer('trf-001', 'approver-1', 'manager')
      expect(result.status).toBe('approved')
    })

    it('rejects approval of non-pending transfer', () => {
      const transferRepo = service['transferRepo']
      transferRepo.findById = vi.fn().mockReturnValue({ ...mockTransfer, status: 'approved' })

      expect(() => service.approveTransfer('trf-001', 'approver-1', 'manager')).toThrow(
        'Only pending transfers can be approved',
      )
    })

    it('throws when transfer not found', () => {
      const transferRepo = service['transferRepo']
      transferRepo.findById = vi.fn().mockReturnValue(null)

      expect(() => service.approveTransfer('nonexistent', 'user-1', 'admin')).toThrow(
        'Transfer not found',
      )
    })
  })

  describe('completeTransfer', () => {
    it('completes an approved transfer (updates asset location/custodian)', () => {
      const transferRepo = service['transferRepo']
      transferRepo.findById = vi.fn().mockReturnValue({ ...mockTransfer, status: 'approved' })
      const assetRepo = service['assetRepo']

      const result = service.completeTransfer('trf-001')
      expect(result.status).toBe('completed')
      expect(assetRepo.update).toHaveBeenCalledWith('ast-001', {
        locationId: 'loc-002',
        custodianId: 'cust-002',
      })
    })

    it('rejects completion of non-approved transfer', () => {
      const transferRepo = service['transferRepo']
      transferRepo.findById = vi.fn().mockReturnValue({ ...mockTransfer, status: 'pending' })

      expect(() => service.completeTransfer('trf-001')).toThrow(
        'Only approved transfers can be completed',
      )
    })

    it('throws when transfer not found', () => {
      const transferRepo = service['transferRepo']
      transferRepo.findById = vi.fn().mockReturnValue(null)

      expect(() => service.completeTransfer('nonexistent')).toThrow('Transfer not found')
    })
  })
})
