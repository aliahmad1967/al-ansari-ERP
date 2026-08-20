import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LeaveService } from '@/modules/attendance/services/LeaveService'

const mockLeaveType = {
  _id: 'lt-001',
  name: 'Annual Leave',
  nameAr: 'إجازة سنوية',
  code: 'ANNUAL',
  defaultDays: 21,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
  deletedAt: null,
}

const mockLeaveRequest = {
  _id: 'lr-001',
  employeeId: 'emp-001',
  leaveTypeId: 'lt-001',
  startDate: new Date(2025, 6, 1),
  endDate: new Date(2025, 6, 5),
  totalDays: 5,
  reason: 'Vacation',
  status: 'pending_manager',
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
  deletedAt: null,
}

const mockBalance = {
  _id: 'lb-001',
  employeeId: 'emp-001',
  leaveTypeId: 'lt-001',
  year: 2025,
  totalDays: 21,
  usedDays: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
  deletedAt: null,
}

vi.mock('@/core/repositories/LeaveTypeRepository', () => ({
  LeaveTypeRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([{ ...mockLeaveType }]),
      findActive: vi.fn().mockReturnValue([{ ...mockLeaveType }]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return { ...mockLeaveType, ...input, _id: 'lt-001' }
      }),
    }
  }),
}))

vi.mock('@/core/repositories/LeaveBalanceRepository', () => ({
  LeaveBalanceRepository: vi.fn().mockImplementation(function () {
    return {
      findByEmployee: vi.fn().mockReturnValue([{ ...mockBalance }]),
      findByEmployeeAndType: vi.fn().mockReturnValue({ ...mockBalance }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return { ...mockBalance, ...changes }
      }),
    }
  }),
}))

vi.mock('@/core/repositories/LeaveRequestRepository', () => ({
  LeaveRequestRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([{ ...mockLeaveRequest }]),
      findById: vi.fn().mockImplementation(function (id: string) {
        if (id === 'nonexistent') return null
        return { ...mockLeaveRequest }
      }),
      findByEmployee: vi.fn().mockReturnValue([{ ...mockLeaveRequest }]),
      findPending: vi.fn().mockReturnValue([{ ...mockLeaveRequest }]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return { ...mockLeaveRequest, ...input, _id: 'lr-001' }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return { ...mockLeaveRequest, ...changes, _id: id }
      }),
    }
  }),
}))

vi.mock('@/core/repositories/LeaveApprovalRepository', () => ({
  LeaveApprovalRepository: vi.fn().mockImplementation(function () {
    return {
      findByLeaveRequest: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return { _id: 'la-001', ...input }
      }),
    }
  }),
}))

vi.mock('@/core/repositories/AuditRepository', () => ({
  AuditRepository: vi.fn().mockImplementation(function () {
    return { create: vi.fn() }
  }),
}))

describe('LeaveService', () => {
  let service: LeaveService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new LeaveService()
  })

  describe('findAllTypes', () => {
    it('returns all leave types', () => {
      expect(service.findAllTypes()).toHaveLength(1)
    })
  })

  describe('findActiveTypes', () => {
    it('returns active leave types', () => {
      expect(service.findActiveTypes()).toHaveLength(1)
    })
  })

  describe('findBalances', () => {
    it('returns balances for employee', () => {
      expect(service.findBalances('emp-001')).toHaveLength(1)
    })
  })

  describe('findAllRequests', () => {
    it('returns all requests', () => {
      expect(service.findAllRequests()).toHaveLength(1)
    })
  })

  describe('findPendingRequests', () => {
    it('returns pending requests', () => {
      expect(service.findPendingRequests()).toHaveLength(1)
    })
  })

  describe('createType', () => {
    it('creates a leave type', () => {
      const result = service.createType(
        { name: 'Sick Leave', code: 'SICK', defaultDays: 10, isActive: true } as never,
        'user-1',
        'admin',
      )
      expect(result.name).toBe('Sick Leave')
    })
  })

  describe('createRequest', () => {
    it('creates a leave request with pending status', () => {
      const result = service.createRequest(
        { employeeId: 'emp-001', leaveTypeId: 'lt-001', startDate: new Date(), endDate: new Date(), totalDays: 5, reason: 'Vacation' } as never,
        'user-1',
        'admin',
      )
      expect(result.status).toBe('pending_manager')
    })
  })

  describe('approveRequest', () => {
    it('advances to pending_hr when manager approves', () => {
      const result = service.approveRequest('lr-001', 'manager', 'user-1', 'manager')
      expect(result.status).toBe('pending_hr')
    })

    it('fully approves when hr approves', () => {
      const result = service.approveRequest('lr-001', 'hr', 'user-1', 'hr-admin')
      expect(result.status).toBe('approved')
    })

    it('throws for nonexistent request', () => {
      expect(() => service.approveRequest('nonexistent', 'manager', 'user-1', 'mgr')).toThrow(
        'Leave request not found',
      )
    })
  })

  describe('rejectRequest', () => {
    it('rejects a leave request', () => {
      const result = service.rejectRequest(
        'lr-001',
        'manager',
        'user-1',
        'manager',
        'Not enough coverage',
      )
      expect(result.status).toBe('rejected')
    })
  })

  describe('cancelRequest', () => {
    it('cancels a leave request', () => {
      const result = service.cancelRequest('lr-001', 'user-1', 'admin')
      expect(result.status).toBe('cancelled')
    })
  })
})
