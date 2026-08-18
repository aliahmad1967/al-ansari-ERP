import { LedgerTransactionRepository } from '@/core/repositories/LedgerTransactionRepository'
import { AccountRepository } from '@/core/repositories/AccountRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'
import { money, toNumber } from '@/core/utils/currency'

export interface AccountBalance {
  accountId: string
  accountCode: string
  accountName: string
  accountNameAr: string | null
  accountType: string
  totalDebit: number
  totalCredit: number
  balance: number
}

export interface TrialBalanceRow {
  accountId: string
  accountCode: string
  accountName: string
  accountNameAr: string | null
  accountType: string
  debit: number
  credit: number
}

export class LedgerService {
  private readonly ledgerRepo = new LedgerTransactionRepository()
  private readonly accountRepo = new AccountRepository()

  getAccountTransactions(accountId: string, options: FindOptions = {}) {
    return this.ledgerRepo.findByAccount(accountId, options)
  }

  getTransactionsByPeriod(fiscalPeriodId: string, options: FindOptions = {}) {
    return this.ledgerRepo.findByFiscalPeriod(fiscalPeriodId, options)
  }

  getTransactionsByDateRange(startDate: Date, endDate: Date, options: FindOptions = {}) {
    return this.ledgerRepo.findByDateRange(startDate, endDate, options)
  }

  getAccountBalance(accountId: string): number {
    const transactions = this.ledgerRepo.findByAccount(accountId)
    if (transactions.length === 0) return 0
    const lastTransaction = transactions[transactions.length - 1]
    return lastTransaction!.balance
  }

  getAccountBalancesAsOf(fiscalPeriodId: string): AccountBalance[] {
    const accounts = this.accountRepo.findActive({ sortBy: 'code' })
    const result: AccountBalance[] = []

    for (const account of accounts) {
      const transactions = this.ledgerRepo.findByAccountAndPeriod(account._id, fiscalPeriodId)
      if (transactions.length === 0) continue

      const totalDebit = toNumber(
        transactions.reduce((sum, t) => sum.plus(money(t.debit)), money(0)),
      )
      const totalCredit = toNumber(
        transactions.reduce((sum, t) => sum.plus(money(t.credit)), money(0)),
      )
      const lastTx = transactions[transactions.length - 1]
      const balance = lastTx!.balance

      result.push({
        accountId: account._id,
        accountCode: account.code,
        accountName: account.name,
        accountNameAr: account.nameAr,
        accountType: account.type,
        totalDebit,
        totalCredit,
        balance,
      })
    }

    return result
  }

  getTrialBalance(fiscalPeriodId: string): TrialBalanceRow[] {
    const balances = this.getAccountBalancesAsOf(fiscalPeriodId)
    return balances.map((b) => ({
      accountId: b.accountId,
      accountCode: b.accountCode,
      accountName: b.accountName,
      accountNameAr: b.accountNameAr,
      accountType: b.accountType,
      debit: b.balance > 0 ? b.balance : 0,
      credit: b.balance < 0 ? Math.abs(b.balance) : 0,
    }))
  }

  getProfitAndLoss(fiscalPeriodId: string) {
    const balances = this.getAccountBalancesAsOf(fiscalPeriodId)

    const revenueAccounts = balances.filter((b) => b.accountType === 'revenue')
    const expenseAccounts = balances.filter((b) => b.accountType === 'expense')

    const totalRevenue = toNumber(
      revenueAccounts.reduce((sum, a) => sum.plus(money(Math.abs(a.balance))), money(0)),
    )
    const totalExpenses = toNumber(
      expenseAccounts.reduce((sum, a) => sum.plus(money(Math.abs(a.balance))), money(0)),
    )
    const netIncome = toNumber(money(totalRevenue).minus(money(totalExpenses)))

    return {
      revenue: revenueAccounts.map((a) => ({
        accountId: a.accountId,
        accountCode: a.accountCode,
        accountName: a.accountName,
        accountNameAr: a.accountNameAr,
        amount: Math.abs(a.balance),
      })),
      totalRevenue,
      expenses: expenseAccounts.map((a) => ({
        accountId: a.accountId,
        accountCode: a.accountCode,
        accountName: a.accountName,
        accountNameAr: a.accountNameAr,
        amount: Math.abs(a.balance),
      })),
      totalExpenses,
      netIncome,
    }
  }

  getBalanceSheet(fiscalPeriodId: string) {
    const balances = this.getAccountBalancesAsOf(fiscalPeriodId)

    const assetAccounts = balances.filter((b) => b.accountType === 'asset')
    const liabilityAccounts = balances.filter((b) => b.accountType === 'liability')
    const equityAccounts = balances.filter((b) => b.accountType === 'equity')

    const totalAssets = toNumber(
      assetAccounts.reduce((sum, a) => sum.plus(money(a.balance)), money(0)),
    )
    const totalLiabilities = toNumber(
      liabilityAccounts.reduce((sum, a) => sum.plus(money(Math.abs(a.balance))), money(0)),
    )
    const totalEquity = toNumber(
      equityAccounts.reduce((sum, a) => sum.plus(money(Math.abs(a.balance))), money(0)),
    )

    return {
      assets: assetAccounts.map((a) => ({
        accountId: a.accountId,
        accountCode: a.accountCode,
        accountName: a.accountName,
        accountNameAr: a.accountNameAr,
        amount: a.balance,
      })),
      totalAssets,
      liabilities: liabilityAccounts.map((a) => ({
        accountId: a.accountId,
        accountCode: a.accountCode,
        accountName: a.accountName,
        accountNameAr: a.accountNameAr,
        amount: Math.abs(a.balance),
      })),
      totalLiabilities,
      equity: equityAccounts.map((a) => ({
        accountId: a.accountId,
        accountCode: a.accountCode,
        accountName: a.accountName,
        accountNameAr: a.accountNameAr,
        amount: Math.abs(a.balance),
      })),
      totalEquity,
      totalLiabilitiesAndEquity: toNumber(money(totalLiabilities).plus(money(totalEquity))),
    }
  }

  getCashFlow(fiscalPeriodId: string) {
    const balances = this.getAccountBalancesAsOf(fiscalPeriodId)

    const cashAccounts = balances.filter(
      (b) => b.accountType === 'asset' && (b.accountCode.startsWith('101') || b.accountCode.startsWith('102')),
    )

    const operatingInflows = toNumber(
      cashAccounts
        .filter((a) => a.totalDebit > 0)
        .reduce((sum, a) => sum.plus(money(a.totalDebit)), money(0)),
    )
    const operatingOutflows = toNumber(
      cashAccounts
        .filter((a) => a.totalCredit > 0)
        .reduce((sum, a) => sum.plus(money(a.totalCredit)), money(0)),
    )

    const netCashFlow = toNumber(money(operatingInflows).minus(money(operatingOutflows)))

    return {
      operating: {
        inflows: operatingInflows,
        outflows: operatingOutflows,
        net: netCashFlow,
      },
      investing: { inflows: 0, outflows: 0, net: 0 },
      financing: { inflows: 0, outflows: 0, net: 0 },
      netCashFlow,
    }
  }

  getAccountsReceivable(fiscalPeriodId: string) {
    const balances = this.getAccountBalancesAsOf(fiscalPeriodId)
    return balances
      .filter((b) => b.accountType === 'asset' && b.accountCode.startsWith('120'))
      .map((a) => ({
        accountId: a.accountId,
        accountCode: a.accountCode,
        accountName: a.accountName,
        accountNameAr: a.accountNameAr,
        balance: a.balance,
      }))
  }

  getAccountsPayable(fiscalPeriodId: string) {
    const balances = this.getAccountBalancesAsOf(fiscalPeriodId)
    return balances
      .filter((b) => b.accountType === 'liability' && b.accountCode.startsWith('210'))
      .map((a) => ({
        accountId: a.accountId,
        accountCode: a.accountCode,
        accountName: a.accountName,
        accountNameAr: a.accountNameAr,
        balance: Math.abs(a.balance),
      }))
  }

  getExpenseReport(fiscalPeriodId: string) {
    const balances = this.getAccountBalancesAsOf(fiscalPeriodId)
    return balances
      .filter((b) => b.accountType === 'expense')
      .map((a) => ({
        accountId: a.accountId,
        accountCode: a.accountCode,
        accountName: a.accountName,
        accountNameAr: a.accountNameAr,
        totalDebit: a.totalDebit,
        totalCredit: a.totalCredit,
        amount: Math.abs(a.balance),
      }))
  }

  getRevenueReport(fiscalPeriodId: string) {
    const balances = this.getAccountBalancesAsOf(fiscalPeriodId)
    return balances
      .filter((b) => b.accountType === 'revenue')
      .map((a) => ({
        accountId: a.accountId,
        accountCode: a.accountCode,
        accountName: a.accountName,
        accountNameAr: a.accountNameAr,
        totalDebit: a.totalDebit,
        totalCredit: a.totalCredit,
        amount: Math.abs(a.balance),
      }))
  }
}
