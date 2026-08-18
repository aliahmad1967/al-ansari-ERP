import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AccountService } from '@/modules/accounting/services/AccountService'

vi.mock('@/core/repositories/AccountRepository', () => ({
  AccountRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockReturnValue(null),
      findActive: vi.fn().mockReturnValue([]),
      findByCode: vi.fn().mockReturnValue(null),
      findByType: vi.fn().mockReturnValue([]),
      findByParent: vi.fn().mockReturnValue([]),
      findByAccountGroup: vi.fn().mockReturnValue([]),
      findLeafAccounts: vi.fn().mockReturnValue([]),
      search: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return {
          _id: 'acc-001',
          code: input.code,
          name: input.name,
          nameAr: input.nameAr ?? null,
          type: input.type,
          parentAccountId: input.parentAccountId ?? null,
          accountGroupId: input.accountGroupId ?? null,
          level: input.level ?? 0,
          isGroup: input.isGroup ?? false,
          isActive: true,
          currency: input.currency ?? 'SAR',
          description: input.description ?? null,
          descriptionAr: input.descriptionAr ?? null,
          openingBalance: input.openingBalance ?? 0,
          currentBalance: input.currentBalance ?? 0,
          costCenterId: input.costCenterId ?? null,
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
          code: 'AC-001',
          name: changes.name ?? 'Test Account',
          type: 'asset',
          level: 0,
          isGroup: false,
          isActive: true,
          currency: 'SAR',
          openingBalance: 0,
          currentBalance: 0,
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

vi.mock('@/core/repositories/AccountGroupRepository', () => ({
  AccountGroupRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockReturnValue(null),
      findByCode: vi.fn().mockReturnValue(null),
      findActive: vi.fn().mockReturnValue([]),
      search: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return {
          _id: 'grp-001',
          code: input.code,
          name: input.name,
          type: input.type,
          sortOrder: input.sortOrder ?? 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          deletedAt: null,
        }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return { _id: id, code: 'GRP-001', name: changes.name ?? 'Test Group', type: 'asset', isActive: true, createdAt: new Date(), updatedAt: new Date(), isDeleted: false, deletedAt: null }
      }),
      softDelete: vi.fn().mockReturnValue(true),
      restore: vi.fn().mockReturnValue(true),
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

  describe('createAccount', () => {
    it('creates an account with correct properties', () => {
      const result = service.createAccount(
        { code: '1000', name: 'Cash', type: 'asset' },
        'user-1',
        'admin',
      )
      expect(result._id).toBe('acc-001')
      expect(result.code).toBe('1000')
      expect(result.name).toBe('Cash')
      expect(result.type).toBe('asset')
    })

    it('throws on duplicate code', () => {
      const repo = service['accountRepo']
      repo.findByCode = vi.fn().mockReturnValue({ _id: 'existing', code: '1000' })
      expect(() =>
        service.createAccount({ code: '1000', name: 'Cash', type: 'asset' }),
      ).toThrow('already exists')
    })
  })

  describe('updateAccount', () => {
    it('updates account properties', () => {
      const result = service.updateAccount('acc-001', { name: 'Updated Account' })
      expect(result.name).toBe('Updated Account')
    })
  })

  describe('archiveAccount', () => {
    it('archives an account', () => {
      const repo = service['accountRepo']
      repo.findById = vi.fn().mockReturnValue({
        _id: 'acc-001',
        code: '1000',
        name: 'Cash',
        currentBalance: 0,
      })
      expect(service.archiveAccount('acc-001')).toBe(true)
    })

    it('throws on non-zero balance', () => {
      const repo = service['accountRepo']
      repo.findById = vi.fn().mockReturnValue({
        _id: 'acc-001',
        code: '1000',
        name: 'Cash',
        currentBalance: 500,
      })
      expect(() => service.archiveAccount('acc-001')).toThrow('non-zero balance')
    })

    it('throws when account has children', () => {
      const repo = service['accountRepo']
      repo.findById = vi.fn().mockReturnValue({
        _id: 'acc-001',
        code: '1000',
        name: 'Assets',
        currentBalance: 0,
      })
      repo.findByParent = vi.fn().mockReturnValue([{ _id: 'child-1' }])
      expect(() => service.archiveAccount('acc-001')).toThrow('child accounts')
    })
  })

  describe('restoreAccount', () => {
    it('restores an archived account', () => {
      expect(service.restoreAccount('acc-001')).toBe(true)
    })
  })

  describe('createGroup', () => {
    it('creates an account group', () => {
      const result = service.createGroup(
        { code: 'GRP-001', name: 'Current Assets', type: 'asset' },
        'user-1',
        'admin',
      )
      expect(result._id).toBe('grp-001')
      expect(result.code).toBe('GRP-001')
    })
  })
})
