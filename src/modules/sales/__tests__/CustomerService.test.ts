import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CustomerService } from '@/modules/sales/services/CustomerService'

vi.mock('@/core/repositories/CustomerRepository', () => ({
  CustomerRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockReturnValue(null),
      findActive: vi.fn().mockReturnValue([]),
      findByCode: vi.fn().mockReturnValue(null),
      search: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return {
          _id: 'cust-001',
          code: input.code,
          name: input.name,
          balance: 0,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          deletedAt: null,
        }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return {
          _id: id,
          code: 'CUST-001',
          name: changes.name ?? 'Test Customer',
          balance: 0,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          deletedAt: null,
        }
      }),
      softDelete: vi.fn().mockReturnValue(true),
      restore: vi.fn().mockReturnValue(true),
      updateBalance: vi.fn(),
    }
  }),
}))

vi.mock('@/core/repositories/AuditRepository', () => ({
  AuditRepository: vi.fn().mockImplementation(function () {
    return {
      create: vi.fn(),
    }
  }),
}))

describe('CustomerService', () => {
  let service: CustomerService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new CustomerService()
  })

  describe('createCustomer', () => {
    it('creates a customer with audit log', () => {
      const result = service.createCustomer(
        { code: 'CUST-001', name: 'Acme Corp', email: 'contact@acme.com' },
        'user-1',
        'admin',
      )
      expect(result._id).toBe('cust-001')
      expect(result.code).toBe('CUST-001')
      expect(result.name).toBe('Acme Corp')
    })
  })

  describe('updateCustomer', () => {
    it('updates a customer with audit log', () => {
      const result = service.updateCustomer('cust-001', { name: 'Updated Corp' }, 'user-1', 'admin')
      expect(result.name).toBe('Updated Corp')
    })
  })

  describe('archiveCustomer', () => {
    it('archives (soft-deletes) a customer', () => {
      expect(service.archiveCustomer('cust-001', 'user-1', 'admin')).toBe(true)
    })
  })

  describe('restoreCustomer', () => {
    it('restores an archived customer', () => {
      expect(service.restoreCustomer('cust-001', 'user-1', 'admin')).toBe(true)
    })
  })

  describe('adjustBalance', () => {
    it('adjusts customer balance', () => {
      service.adjustBalance('cust-001', 500)
    })
  })
})
