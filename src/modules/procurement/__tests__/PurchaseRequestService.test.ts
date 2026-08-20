import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PurchaseRequestService } from '@/modules/procurement/services/PurchaseRequestService'
import { PurchaseRequestStatus } from '@/core/models/PurchaseRequest'

const mockRequest = {
  _id: 'pr-001',
  code: 'PR-000001',
  status: PurchaseRequestStatus.PendingApproval,
  totalEstimatedCost: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
  deletedAt: null,
}

vi.mock('@/core/repositories/PurchaseRequestRepository', () => ({
  PurchaseRequestRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockImplementation(function (id: string) {
        if (id === 'nonexistent') return null
        return { ...mockRequest }
      }),
      findByStatus: vi.fn().mockReturnValue([{ ...mockRequest }]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return { ...mockRequest, ...input, _id: 'pr-001' }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return { ...mockRequest, ...changes, _id: id }
      }),
    }
  }),
}))

vi.mock('@/core/repositories/PurchaseRequestItemRepository', () => ({
  PurchaseRequestItemRepository: vi.fn().mockImplementation(function () {
    return {
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return { _id: 'pri-001', ...input }
      }),
    }
  }),
}))

vi.mock('@/core/repositories/AuditRepository', () => ({
  AuditRepository: vi.fn().mockImplementation(function () {
    return { create: vi.fn() }
  }),
}))

describe('PurchaseRequestService', () => {
  let service: PurchaseRequestService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new PurchaseRequestService()
  })

  describe('findAllRequests', () => {
    it('returns all requests', () => {
      expect(service.findAllRequests()).toEqual([])
    })
  })

  describe('findRequestById', () => {
    it('finds request by id', () => {
      expect(service.findRequestById('pr-001')).toBeDefined()
    })

    it('returns null for nonexistent', () => {
      expect(service.findRequestById('nonexistent')).toBeNull()
    })
  })

  describe('findPendingRequests', () => {
    it('returns pending requests', () => {
      expect(service.findPendingRequests()).toHaveLength(1)
    })
  })

  describe('createRequest', () => {
    it('creates a request with items', () => {
      const result = service.createRequest(
        { requestedByUserId: 'user-1' } as never,
        [
          { productId: 'prod-001', quantity: 10, unitPrice: 100 },
          { productId: 'prod-002', quantity: 5, unitPrice: 200 },
        ],
        'user-1',
        'admin',
      )
      expect(result.code).toMatch(/^PR-/)
    })
  })

  describe('approveRequest', () => {
    it('approves a pending request', () => {
      const result = service.approveRequest('pr-001', 'user-1', 'admin')
      expect(result.status).toBe(PurchaseRequestStatus.Approved)
    })

    it('throws for nonexistent request', () => {
      expect(() => service.approveRequest('nonexistent', 'user-1', 'admin')).toThrow('not found')
    })

    it('throws when not in pending status', () => {
      const svc = service as unknown as { requestRepo: { findById: ReturnType<typeof vi.fn> } }
      svc.requestRepo.findById.mockReturnValue({ ...mockRequest, status: PurchaseRequestStatus.Approved })
      expect(() => service.approveRequest('pr-001', 'user-1', 'admin')).toThrow('Cannot approve request in status')
    })
  })

  describe('rejectRequest', () => {
    it('rejects a pending request', () => {
      const result = service.rejectRequest('pr-001', 'Too expensive', 'user-1', 'admin')
      expect(result.status).toBe(PurchaseRequestStatus.Rejected)
    })
  })

  describe('cancelRequest', () => {
    it('cancels a request', () => {
      const result = service.cancelRequest('pr-001', 'user-1', 'admin')
      expect(result.status).toBe(PurchaseRequestStatus.Cancelled)
    })
  })
})
