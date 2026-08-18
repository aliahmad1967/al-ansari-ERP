import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LedgerService } from '@/modules/accounting/services/LedgerService'

vi.mock('@/core/repositories/LedgerTransactionRepository', () => ({
  LedgerTransactionRepository: vi.fn().mockImplementation(function () {
    return {
      findByAccount: vi.fn().mockReturnValue([]),
      findByFiscalPeriod: vi.fn().mockReturnValue([]),
      findByAccountAndPeriod: vi.fn().mockReturnValue([]),
    }
  }),
}))

vi.mock('@/core/repositories/AccountRepository', () => ({
  AccountRepository: vi.fn().mockImplementation(function () {
    return {
      findActive: vi.fn().mockReturnValue([]),
    }
  }),
}))

describe('LedgerService', () => {
  let service: LedgerService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new LedgerService()
  })

  describe('getAccountBalance', () => {
    it('returns 0 for account with no transactions', () => {
      expect(service.getAccountBalance('acc-001')).toBe(0)
    })
  })

  describe('getAccountBalancesAsOf', () => {
    it('returns empty array when no accounts have transactions', () => {
      const result = service.getAccountBalancesAsOf('period-001')
      expect(result).toEqual([])
    })
  })

  describe('getTrialBalance', () => {
    it('returns trial balance with debit/credit separation', () => {
      const result = service.getTrialBalance('period-001')
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('getProfitAndLoss', () => {
    it('returns P&L structure', () => {
      const result = service.getProfitAndLoss('period-001')
      expect(result).toHaveProperty('revenue')
      expect(result).toHaveProperty('totalRevenue')
      expect(result).toHaveProperty('expenses')
      expect(result).toHaveProperty('totalExpenses')
      expect(result).toHaveProperty('netIncome')
    })
  })

  describe('getBalanceSheet', () => {
    it('returns balance sheet structure', () => {
      const result = service.getBalanceSheet('period-001')
      expect(result).toHaveProperty('assets')
      expect(result).toHaveProperty('totalAssets')
      expect(result).toHaveProperty('liabilities')
      expect(result).toHaveProperty('totalLiabilities')
      expect(result).toHaveProperty('equity')
      expect(result).toHaveProperty('totalEquity')
      expect(result).toHaveProperty('totalLiabilitiesAndEquity')
    })
  })

  describe('getCashFlow', () => {
    it('returns cash flow structure', () => {
      const result = service.getCashFlow('period-001')
      expect(result).toHaveProperty('operating')
      expect(result).toHaveProperty('investing')
      expect(result).toHaveProperty('financing')
      expect(result).toHaveProperty('netCashFlow')
    })
  })
})
