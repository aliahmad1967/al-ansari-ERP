import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AccountService } from '@/modules/accounting/services/AccountService'

const mockAccount = {
  _id: 'acc-001',
  code: '1010',
  name: 'Cash',
  nameAr: 'نقداً',
  type: 'asset',
  parentId: null,
  level: 1,
  isGroup: false,
  isActive: true,
  currency: 'SAR',
  openingBalance: 0,
  currentBalance: 0,
  normalBalance: 'debit',
  createdAt: new Date(),
  updatedAt: new Date(),
  isDeleted: false,
  deletedAt: null,
}

vi.mock('@/core/repositories/AccountRepository', () => ({
  AccountRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockImplementation(function (id: string) {
        if (id === 'nonexistent') return null
        return { ...mockAccount }
      }),
      findByCode: vi.fn().mockImplementation(function (code: string) {
        if (code === '1010') return { ...mockAccount }
        return null
      }),
      findByType: vi.fn().mockReturnValue([]),
      findByParent: vi.fn().mockReturnValue([]),
      findActive: vi.fn().mockReturnValue([]),
      findLeaf: vi.fn().mockReturnValue([]),
      findGroup: vi.fn().mockReturnValue([]),
      search: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return { ...mockAccount, ...input, _id: 'acc-001' }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return { ...mockAccount, ...changes, _id: id }
      }),
      updateBalance: vi.fn(),
      softDelete: vi.fn().mockReturnValue(true),
      restore: vi.fn().mockReturnValue(true),
    }
  }),
}))

vi.mock('@/core/repositories/AccountGroupRepository', () => ({
  AccountGroupRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockReturnValue(null),
      findByCode: vi.fn().mockReturnValue(null),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return { _id: 'ag-001', ...input }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return { _id: id, ...changes }
      }),
      softDelete: vi.fn().mockReturnValue(true),
    }
  }),
}))

vi.mock('@/core/repositories/AuditRepository', () => ({
  AuditRepository: vi.fn().mockImplementation(function () {
    return { create: vi.fn() }
  }),
}))

describe('AccountService', () => {
  let service: AccountService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new AccountService()
  })

  describe('findAllAccounts', () => {
    it('returns all accounts', () => {
      expect(service.findAllAccounts()).toEqual([])
    })
  })

  describe('findAccountById', () => {
    it('finds account by id', () => {
      expect(service.findAccountById('acc-001')).toBeDefined()
    })

    it('returns null for nonexistent', () => {
      expect(service.findAccountById('nonexistent')).toBeNull()
    })
  })

  describe('findAccountByCode', () => {
    it('finds account by code', () => {
      expect(service.findAccountByCode('1010')).toBeDefined()
    })

    it('returns null for unknown code', () => {
      expect(service.findAccountByCode('9999')).toBeNull()
    })
  })

  describe('createAccount', () => {
    it('creates an account', () => {
      const result = service.createAccount(
        { code: '2010', name: 'Accounts Payable', type: 'liability', normalBalance: 'credit' } as never,
        'user-1',
        'admin',
      )
      expect(result._id).toBe('acc-001')
    })

    it('rejects duplicate code', () => {
      const svc = service as unknown as { accountRepo: { findByCode: ReturnType<typeof vi.fn> } }
      svc.accountRepo.findByCode.mockReturnValue({ ...mockAccount })
      expect(() =>
        service.createAccount({ code: '1010', name: 'Cash', type: 'asset', normalBalance: 'debit' } as never, 'user-1', 'admin'),
      ).toThrow('already exists')
    })
  })

  describe('archiveAccount', () => {
    it('archives an account with zero balance', () => {
      expect(service.archiveAccount('acc-001', 'user-1', 'admin')).toBe(true)
    })
  })

  describe('restoreAccount', () => {
    it('restores an account', () => {
      expect(service.restoreAccount('acc-001', 'user-1', 'admin')).toBe(true)
    })
  })

  describe('updateAccountBalance', () => {
    it('updates balance with debit', () => {
      const svc = service as unknown as { accountRepo: { findById: ReturnType<typeof vi.fn>; updateBalance: ReturnType<typeof vi.fn> } }
      svc.accountRepo.findById.mockReturnValue({ ...mockAccount, normalBalance: 'debit' })
      service.updateAccountBalance('acc-001', 1000, 0)
      expect(svc.accountRepo.updateBalance).toHaveBeenCalled()
    })

    it('updates balance with credit', () => {
      const svc = service as unknown as { accountRepo: { findById: ReturnType<typeof vi.fn>; updateBalance: ReturnType<typeof vi.fn> } }
      svc.accountRepo.findById.mockReturnValue({ ...mockAccount, normalBalance: 'credit' })
      service.updateAccountBalance('acc-001', 0, 500)
      expect(svc.accountRepo.updateBalance).toHaveBeenCalled()
    })
  })
})
