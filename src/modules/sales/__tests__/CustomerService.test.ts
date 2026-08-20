import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CustomerService } from '@/modules/sales/services/CustomerService'

const mockCustomer = {
  _id: 'cust-001',
  name: 'Acme Corp',
  code: 'CUST-001',
  contactEmail: 'info@acme.com',
  balance: 0,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
  deletedAt: null,
}

vi.mock('@/core/repositories/CustomerRepository', () => ({
  CustomerRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockImplementation(function (id: string) {
        if (id === 'nonexistent') return null
        return { ...mockCustomer }
      }),
      findActive: vi.fn().mockReturnValue([{ ...mockCustomer }]),
      findByCode: vi.fn().mockImplementation(function (code: string) {
        if (code === 'CUST-001') return { ...mockCustomer }
        return null
      }),
      search: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return { ...mockCustomer, ...input, _id: 'cust-001' }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return { ...mockCustomer, ...changes, _id: id }
      }),
      softDelete: vi.fn().mockReturnValue(true),
      restore: vi.fn().mockReturnValue(true),
      updateBalance: vi.fn(),
    }
  }),
}))

vi.mock('@/core/repositories/AuditRepository', () => ({
  AuditRepository: vi.fn().mockImplementation(function () {
    return { create: vi.fn() }
  }),
}))

describe('CustomerService', () => {
  let service: CustomerService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new CustomerService()
  })

  describe('findAllCustomers', () => {
    it('returns all customers', () => {
      expect(service.findAllCustomers()).toEqual([])
    })
  })

  describe('findCustomerById', () => {
    it('finds customer by id', () => {
      const result = service.findCustomerById('cust-001')
      expect(result).toBeDefined()
      expect(result?.name).toBe('Acme Corp')
    })

    it('returns null for nonexistent', () => {
      expect(service.findCustomerById('nonexistent')).toBeNull()
    })
  })

  describe('findActiveCustomers', () => {
    it('returns active customers', () => {
      expect(service.findActiveCustomers()).toHaveLength(1)
    })
  })

  describe('findCustomerByCode', () => {
    it('finds customer by code', () => {
      expect(service.findCustomerByCode('CUST-001')).toBeDefined()
    })

    it('returns null for unknown code', () => {
      expect(service.findCustomerByCode('UNKNOWN')).toBeNull()
    })
  })

  describe('createCustomer', () => {
    it('creates a customer', () => {
      const result = service.createCustomer(
        { name: 'Acme Corp', code: 'CUST-001' } as never,
        'user-1',
        'admin',
      )
      expect(result.name).toBe('Acme Corp')
    })
  })

  describe('updateCustomer', () => {
    it('updates a customer', () => {
      const result = service.updateCustomer('cust-001', { name: 'New Corp' }, 'user-1', 'admin')
      expect(result.name).toBe('New Corp')
    })
  })

  describe('archiveCustomer', () => {
    it('archives a customer', () => {
      expect(service.archiveCustomer('cust-001', 'user-1', 'admin')).toBe(true)
    })
  })

  describe('restoreCustomer', () => {
    it('restores a customer', () => {
      expect(service.restoreCustomer('cust-001', 'user-1', 'admin')).toBe(true)
    })
  })
})
