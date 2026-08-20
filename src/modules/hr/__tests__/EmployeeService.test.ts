import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EmployeeService } from '@/modules/hr/services/EmployeeService'

const mockEmployee = {
  _id: 'emp-001',
  firstName: 'Ahmed',
  lastName: 'Al-ANSARI',
  email: 'ahmed@alansari.com',
  status: 'active',
  departmentId: 'dept-001',
  positionId: 'pos-001',
  branchId: 'br-001',
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
  deletedAt: null,
}

vi.mock('@/core/repositories/EmployeeRepository', () => ({
  EmployeeRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockImplementation(function (id: string) {
        if (id === 'nonexistent') return null
        return { ...mockEmployee }
      }),
      search: vi.fn().mockReturnValue([]),
      findByDepartment: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return { ...mockEmployee, ...input, _id: 'emp-001' }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return { ...mockEmployee, ...changes, _id: id }
      }),
      softDelete: vi.fn().mockReturnValue(true),
      restore: vi.fn().mockReturnValue(true),
      count: vi.fn().mockReturnValue(1),
    }
  }),
}))

vi.mock('@/core/repositories/AuditRepository', () => ({
  AuditRepository: vi.fn().mockImplementation(function () {
    return { create: vi.fn() }
  }),
}))

describe('EmployeeService', () => {
  let service: EmployeeService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new EmployeeService()
  })

  describe('findAll', () => {
    it('returns all employees', () => {
      expect(service.findAll()).toEqual([])
    })
  })

  describe('findById', () => {
    it('returns employee by id', () => {
      const result = service.findById('emp-001')
      expect(result).toBeDefined()
      expect(result?._id).toBe('emp-001')
    })

    it('returns null for nonexistent id', () => {
      expect(service.findById('nonexistent')).toBeNull()
    })
  })

  describe('count', () => {
    it('returns count', () => {
      expect(service.count()).toBe(1)
    })
  })

  describe('search', () => {
    it('searches employees', () => {
      expect(service.search('Ahmed')).toEqual([])
    })
  })

  describe('findByDepartment', () => {
    it('finds employees by department', () => {
      expect(service.findByDepartment('dept-001')).toEqual([])
    })
  })

  describe('create', () => {
    it('creates an employee', () => {
      const result = service.create(
        { firstName: 'Ahmed', lastName: 'Al-ANSARI', employeeNumber: 'EMP-001', email: 'ahmed@alansari.com', employmentDate: new Date(), status: 'active', departmentId: 'dept-001', positionId: 'pos-001', branchId: 'br-001' },
        'user-1',
        'admin',
      )
      expect(result._id).toBe('emp-001')
    })
  })

  describe('update', () => {
    it('updates an employee', () => {
      const result = service.update('emp-001', { firstName: 'Updated' }, 'user-1', 'admin')
      expect(result.firstName).toBe('Updated')
    })
  })

  describe('archive', () => {
    it('archives an employee', () => {
      expect(service.archive('emp-001', 'user-1', 'admin')).toBe(true)
    })
  })

  describe('restore', () => {
    it('restores an employee', () => {
      expect(service.restore('emp-001', 'user-1', 'admin')).toBe(true)
    })
  })

  describe('updateStatus', () => {
    it('updates employee status', () => {
      const result = service.updateStatus('emp-001', 'inactive', 'user-1', 'admin')
      expect(result.status).toBe('inactive')
    })
  })
})
