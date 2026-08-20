import { describe, it, expect, vi, beforeEach } from 'vitest'
import { InventoryTransferService } from '@/modules/inventory/services/InventoryTransferService'
import { StockTransferStatus } from '@/core/models/StockTransfer'

const mockTransfer = {
  _id: 'st-001',
  code: 'TRF-000001',
  fromWarehouseId: 'wh-001',
  toWarehouseId: 'wh-002',
  status: StockTransferStatus.Draft,
  expectedArrivalDate: null,
  actualArrivalDate: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
  deletedAt: null,
}

vi.mock('@/core/repositories/StockTransferRepository', () => ({
  StockTransferRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockImplementation(function (id: string) {
        if (id === 'nonexistent') return null
        return { ...mockTransfer }
      }),
      findByStatus: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return { ...mockTransfer, ...input, _id: 'st-001' }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return { ...mockTransfer, ...changes, _id: id }
      }),
    }
  }),
}))

vi.mock('@/core/repositories/AuditRepository', () => ({
  AuditRepository: vi.fn().mockImplementation(function () {
    return { create: vi.fn() }
  }),
}))

describe('InventoryTransferService', () => {
  let service: InventoryTransferService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new InventoryTransferService()
  })

  describe('findAllTransfers', () => {
    it('returns all transfers', () => {
      expect(service.findAllTransfers()).toEqual([])
    })
  })

  describe('findTransferById', () => {
    it('finds transfer by id', () => {
      const result = service.findTransferById('st-001')
      expect(result).toBeDefined()
    })

    it('returns null for nonexistent', () => {
      expect(service.findTransferById('nonexistent')).toBeNull()
    })
  })

  describe('createTransfer', () => {
    it('creates a transfer between different warehouses', () => {
      const result = service.createTransfer(
        { fromWarehouseId: 'wh-001', toWarehouseId: 'wh-002' } as never,
        'user-1',
        'admin',
      )
      expect(result.status).toBe(StockTransferStatus.Draft)
    })

    it('rejects transfer to same warehouse', () => {
      expect(() =>
        service.createTransfer(
          { fromWarehouseId: 'wh-001', toWarehouseId: 'wh-001' } as never,
          'user-1',
          'admin',
        ),
      ).toThrow('Source and destination warehouses must be different')
    })
  })

  describe('updateTransferStatus', () => {
    it('transitions Draft to Pending', () => {
      const result = service.updateTransferStatus('st-001', StockTransferStatus.Pending)
      expect(result.status).toBe(StockTransferStatus.Pending)
    })

    it('transitions Draft to Cancelled', () => {
      const result = service.updateTransferStatus('st-001', StockTransferStatus.Cancelled)
      expect(result.status).toBe(StockTransferStatus.Cancelled)
    })

    it('rejects invalid transition', () => {
      const svc = service as unknown as { transferRepo: { findById: ReturnType<typeof vi.fn> } }
      svc.transferRepo.findById.mockReturnValue({ ...mockTransfer, status: StockTransferStatus.Received })
      expect(() =>
        service.updateTransferStatus('st-001', StockTransferStatus.Draft),
      ).toThrow('Invalid status transition')
    })

    it('throws for nonexistent transfer', () => {
      expect(() =>
        service.updateTransferStatus('nonexistent', StockTransferStatus.Pending),
      ).toThrow('not found')
    })
  })

  describe('cancelTransfer', () => {
    it('cancels a draft transfer', () => {
      const result = service.cancelTransfer('st-001')
      expect(result.status).toBe(StockTransferStatus.Cancelled)
    })
  })
})
