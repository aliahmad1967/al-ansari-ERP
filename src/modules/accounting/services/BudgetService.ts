import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import { BudgetStatus, type BudgetInput, type BudgetStatusValue } from '@/core/models/Budget'
import { BudgetRepository } from '@/core/repositories/BudgetRepository'
import { AccountRepository } from '@/core/repositories/AccountRepository'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'
import { money, toNumber } from '@/core/utils/currency'

export interface BudgetVariance {
  accountId: string
  accountCode: string
  accountName: string
  budgetAmount: number
  spentAmount: number
  variance: number
  variancePercent: number
  status: 'under' | 'over' | 'on_track'
}

export class BudgetService {
  private readonly repo = new BudgetRepository()
  private readonly accountRepo = new AccountRepository()
  private readonly auditRepo = new AuditRepository()

  findAll(options: FindOptions = {}) {
    return this.repo.findAll(options)
  }

  findById(id: string) {
    return this.repo.findById(id)
  }

  findByFiscalYear(fiscalYearId: string, options: FindOptions = {}) {
    return this.repo.findByFiscalYear(fiscalYearId, options)
  }

  findByAccount(accountId: string, options: FindOptions = {}) {
    return this.repo.findByAccount(accountId, options)
  }

  findByStatus(status: BudgetStatusValue, options: FindOptions = {}) {
    return this.repo.findByStatus(status, options)
  }

  findActiveByFiscalYear(fiscalYearId: string, options: FindOptions = {}) {
    return this.repo.findActiveByFiscalYear(fiscalYearId, options)
  }

  create(
    input: BudgetInput,
    actorUserId?: string,
    actorUsername?: string,
  ) {
    const account = this.accountRepo.findById(input.accountId)
    if (!account) {
      throw new Error('Account not found')
    }

    const existing = this.repo.findByAccountAndFiscalYear(input.accountId, input.fiscalYearId)
    if (existing) {
      throw new Error('Budget already exists for this account and fiscal year')
    }

    const budget = this.repo.create({
      accountId: input.accountId,
      fiscalYearId: input.fiscalYearId,
      fiscalPeriodId: input.fiscalPeriodId ?? null,
      amount: input.amount,
      spent: input.spent ?? 0,
      notes: input.notes ?? null,
      status: BudgetStatus.Draft,
      createdByUserId: actorUserId ?? null,
    })

    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'accounting',
      resourceType: 'Budget',
      resourceId: budget._id,
      summary: `Budget for "${account.code} - ${account.name}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return budget
  }

  approveBudget(id: string, actorUserId?: string, actorUsername?: string) {
    const budget = this.repo.findById(id)
    if (!budget) throw new Error('Budget not found')
    if (budget.status !== BudgetStatus.Draft) {
      throw new Error('Only draft budgets can be approved')
    }

    const updated = this.repo.update(id, {
      status: BudgetStatus.Approved,
      approvedAt: new Date(),
      approvedByUserId: actorUserId ?? null,
    })

    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'accounting',
      resourceType: 'Budget',
      resourceId: id,
      summary: `Budget approved`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return updated
  }

  activateBudget(id: string, _actorUserId?: string, _actorUsername?: string) {
    const budget = this.repo.findById(id)
    if (!budget) throw new Error('Budget not found')
    if (budget.status !== BudgetStatus.Approved) {
      throw new Error('Only approved budgets can be activated')
    }

    return this.repo.update(id, { status: BudgetStatus.Active })
  }

  closeBudget(id: string, _actorUserId?: string, _actorUsername?: string) {
    const budget = this.repo.findById(id)
    if (!budget) throw new Error('Budget not found')
    if (budget.status !== BudgetStatus.Active) {
      throw new Error('Only active budgets can be closed')
    }

    return this.repo.update(id, { status: BudgetStatus.Closed })
  }

  updateSpent(id: string, amount: number): void {
    this.repo.updateSpent(id, amount)
  }

  getBudgetVariance(budgetId: string): BudgetVariance | null {
    const budget = this.repo.findById(budgetId)
    if (!budget) return null

    const account = this.accountRepo.findById(budget.accountId)
    if (!account) return null

    const variance = toNumber(money(budget.amount).minus(money(budget.spent)))
    const variancePercent = budget.amount > 0
      ? toNumber(money(variance).times(100).div(budget.amount))
      : 0

    return {
      accountId: account._id,
      accountCode: account.code,
      accountName: account.name,
      budgetAmount: budget.amount,
      spentAmount: budget.spent,
      variance,
      variancePercent,
      status: budget.spent > budget.amount ? 'over' : budget.spent > budget.amount * 0.9 ? 'on_track' : 'under',
    }
  }

  getBudgetVariances(fiscalYearId: string): BudgetVariance[] {
    const budgets = this.repo.findByFiscalYear(fiscalYearId)
    return budgets
      .map((b) => this.getBudgetVariance(b._id))
      .filter((v): v is BudgetVariance => v !== null)
  }
}
