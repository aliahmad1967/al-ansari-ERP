import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AccountingPolicyService } from '@/modules/accounting/services/AccountingPolicyService'

vi.mock('@/core/repositories/AccountingPolicyRepository', () => ({
  AccountingPolicyRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findByKey: vi.fn().mockReturnValue(null),
      getValue: vi.fn().mockReturnValue(null),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return {
          _id: 'pol-001',
          key: input.key,
          value: input.value,
          description: input.description ?? null,
          descriptionAr: input.descriptionAr ?? null,
          updatedAt: new Date(),
        }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return { _id: id, ...changes, updatedAt: new Date() }
      }),
      setValue: vi.fn().mockImplementation(function (key: string, value: string) {
        return {
          _id: 'pol-001',
          key,
          value,
          updatedAt: new Date(),
        }
      }),
    }
  }),
}))

vi.mock('@/core/repositories/AuditRepository', () => ({
  AuditRepository: vi.fn().mockImplementation(function () {
    return { create: vi.fn() }
  }),
}))

describe('AccountingPolicyService', () => {
  let service: AccountingPolicyService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new AccountingPolicyService()
  })

  describe('getValue', () => {
    it('returns null for non-existent key', () => {
      expect(service.getValue('nonexistent')).toBeNull()
    })
  })

  describe('setValue', () => {
    it('creates or updates a policy value', () => {
      const result = service.setValue('currency', 'SAR', 'Base currency', 'العملة الأساسية', 'user-1', 'admin')
      expect(result.key).toBe('currency')
      expect(result.value).toBe('SAR')
    })
  })

  describe('initializeDefaults', () => {
    it('creates default policies', () => {
      service.initializeDefaults('user-1', 'admin')
      const repo = service['repo']
      expect(repo.create).toHaveBeenCalled()
    })
  })
})
