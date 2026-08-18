import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BudgetService } from '@/modules/accounting/services/BudgetService'

const mockAccount = {
  _id: 'acc-001',
  code: '5200',
  name: 'Salary Expense',
  type: 'expense',
}

vi.mock('@/core/repositories/BudgetRepository', () => ({
  BudgetRepository: vi.fn().mockImplementation(function () {
    return {
      findAll: vi.fn().mockReturnValue([]),
      findById: vi.fn().mockReturnValue(null),
      findByFiscalYear: vi.fn().mockReturnValue([]),
      findByAccount: vi.fn().mockReturnValue([]),
      findByStatus: vi.fn().mockReturnValue([]),
      findByAccountAndFiscalYear: vi.fn().mockReturnValue(null),
      findActiveByFiscalYear: vi.fn().mockReturnValue([]),
      create: vi.fn().mockImplementation(function (input: Record<string, unknown>) {
        return {
          _id: 'bud-001',
          accountId: input.accountId,
          fiscalYearId: input.fiscalYearId,
          fiscalPeriodId: input.fiscalPeriodId ?? null,
          amount: input.amount ?? 0,
          spent: input.spent ?? 0,
          notes: input.notes ?? null,
          status: input.status ?? 'draft',
          approvedAt: null,
          approvedByUserId: null,
          createdByUserId: input.createdByUserId ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          deletedAt: null,
        }
      }),
      update: vi.fn().mockImplementation(function (id: string, changes: Record<string, unknown>) {
        return {
          _id: id,
          accountId: 'acc-001',
          fiscalYearId: 'fy-001',
          amount: changes.amount ?? 100000,
          spent: changes.spent ?? 0,
          status: changes.status ?? 'draft',
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          deletedAt: null,
        }
      }),
      softDelete: vi.fn().mockReturnValue(true),
      updateSpent: vi.fn(),
    }
  }),
}))

vi.mock('@/core/repositories/AccountRepository', () => ({
  AccountRepository: vi.fn().mockImplementation(function () {
    return {
      findById: vi.fn().mockReturnValue(mockAccount),
    }
  }),
}))

vi.mock('@/core/repositories/AuditRepository', () => ({
  AuditRepository: vi.fn().mockImplementation(function () {
    return { create: vi.fn() }
  }),
}))

describe('BudgetService', () => {
  let service: BudgetService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new BudgetService()
  })

  describe('create', () => {
    it('creates a budget', () => {
      const result = service.create(
        { accountId: 'acc-001', fiscalYearId: 'fy-001', amount: 100000, spent: 0 },
        'user-1',
        'admin',
      )
      expect(result._id).toBe('bud-001')
      expect(result.amount).toBe(100000)
    })

    it('throws when budget already exists for account and year', () => {
      const repo = service['repo']
      repo.findByAccountAndFiscalYear = vi.fn().mockReturnValue({ _id: 'existing' })
      expect(() =>
        service.create({ accountId: 'acc-001', fiscalYearId: 'fy-001', amount: 100000, spent: 0 }),
      ).toThrow('already exists')
    })

    it('throws when account not found', () => {
      const accountRepo = service['accountRepo']
      accountRepo.findById = vi.fn().mockReturnValue(null)
      expect(() =>
        service.create({ accountId: 'nonexistent', fiscalYearId: 'fy-001', amount: 100000, spent: 0 }),
      ).toThrow('Account not found')
    })
  })

  describe('approveBudget', () => {
    it('approves a draft budget', () => {
      const repo = service['repo']
      repo.findById = vi.fn().mockReturnValue({
        _id: 'bud-001',
        status: 'draft',
      })
      const result = service.approveBudget('bud-001', 'user-1', 'admin')
      expect(result.status).toBe('approved')
    })

    it('throws when budget is not draft', () => {
      const repo = service['repo']
      repo.findById = vi.fn().mockReturnValue({
        _id: 'bud-001',
        status: 'active',
      })
      expect(() => service.approveBudget('bud-001')).toThrow('Only draft budgets')
    })
  })

  describe('getBudgetVariance', () => {
    it('calculates budget variance', () => {
      const repo = service['repo']
      repo.findById = vi.fn().mockReturnValue({
        _id: 'bud-001',
        accountId: 'acc-001',
        amount: 100000,
        spent: 75000,
      })

      const variance = service.getBudgetVariance('bud-001')
      expect(variance).not.toBeNull()
      expect(variance!.budgetAmount).toBe(100000)
      expect(variance!.spentAmount).toBe(75000)
      expect(variance!.variance).toBe(25000)
    })

    it('returns null for non-existent budget', () => {
      const variance = service.getBudgetVariance('nonexistent')
      expect(variance).toBeNull()
    })
  })
})
