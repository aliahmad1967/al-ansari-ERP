import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AttendanceService } from '@/modules/attendance/services/AttendanceService'

const mockRecord = {
  _id: 'att-001',
  employeeId: 'emp-001',
  date: new Date(2025, 5, 15),
  checkIn: new Date(2025, 5, 15, 8, 0),
  checkOut: null,
  status: 'present',
  checkInSource: 'manual',
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
  deletedAt: null,
}

const mockShift = {
  _id: 'shift-001',
  name: 'Morning Shift',
  startTime: '08:00',
  endTime: '17:00',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
  deletedAt: null,
}

vi.mock('@/core/repositories/AttendanceRecordRepository', () => ({
  AttendanceRecordRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockImplementation(function (id: string) {
        if (id === 'nonexistent') return null
        return { ...mockRecord }
      }),
      findByEmployee: vi.fn().mockReturnValue([]),
      findByMonth: vi.fn().mockReturnValue([]),
      findToday: vi.fn().mockReturnValue(null),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return { ...mockRecord, ...input, _id: 'att-001' }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return { ...mockRecord, ...changes, _id: id }
      }),
    }
  }),
}))

vi.mock('@/core/repositories/ShiftRepository', () => ({
  ShiftRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([{ ...mockShift }]),
      findActive: vi.fn().mockReturnValue([{ ...mockShift }]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return { ...mockShift, ...input, _id: 'shift-001' }
      }),
    }
  }),
}))

vi.mock('@/core/repositories/AuditRepository', () => ({
  AuditRepository: vi.fn().mockImplementation(function () {
    return { create: vi.fn() }
  }),
}))

describe('AttendanceService', () => {
  let service: AttendanceService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new AttendanceService()
  })

  describe('findAllRecords', () => {
    it('returns all records', () => {
      expect(service.findAllRecords()).toEqual([])
    })
  })

  describe('findRecordById', () => {
    it('finds record by id', () => {
      const result = service.findRecordById('att-001')
      expect(result).toBeDefined()
      expect(result?._id).toBe('att-001')
    })

    it('returns null for nonexistent id', () => {
      expect(service.findRecordById('nonexistent')).toBeNull()
    })
  })

  describe('checkIn', () => {
    it('creates a check-in record', () => {
      const result = service.checkIn('emp-001', 'manual', 'user-1', 'admin')
      expect(result).toBeDefined()
    })

    it('returns existing record if already checked in today', () => {
      const svc = service as unknown as { recordRepo: { findToday: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> } }
      svc.recordRepo.findToday.mockReturnValue({ ...mockRecord })
      const result = service.checkIn('emp-001')
      expect(svc.recordRepo.create).not.toHaveBeenCalled()
      expect(result._id).toBe('att-001')
    })
  })

  describe('checkOut', () => {
    it('returns null if no check-in today', () => {
      expect(service.checkOut('emp-001')).toBeNull()
    })

    it('updates check-out time', () => {
      const svc = service as unknown as { recordRepo: { findToday: ReturnType<typeof vi.fn> } }
      svc.recordRepo.findToday.mockReturnValue({ ...mockRecord, _id: 'att-001' })
      const result = service.checkOut('emp-001', 'user-1', 'admin')
      expect(result).toBeDefined()
    })
  })

  describe('findAllShifts', () => {
    it('returns all shifts', () => {
      const result = service.findAllShifts()
      expect(result).toHaveLength(1)
    })
  })

  describe('findActiveShifts', () => {
    it('returns active shifts', () => {
      const result = service.findActiveShifts()
      expect(result).toHaveLength(1)
    })
  })

  describe('createShift', () => {
    it('creates a shift', () => {
      const result = service.createShift(
        { name: 'Evening', startTime: '14:00', endTime: '23:00', isActive: true } as never,
        'user-1',
        'admin',
      )
      expect(result.name).toBe('Evening')
    })
  })
})
