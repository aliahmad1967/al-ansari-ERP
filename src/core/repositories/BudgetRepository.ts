import { Budget, type BudgetInput, type BudgetStatusValue } from '../models/Budget'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class BudgetRepository extends BaseRepository<Budget, BudgetInput> {
  protected get objectType(): string {
    return 'Budget'
  }

  protected get modelClass(): ModelConstructor<Budget> {
    return Budget
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      accountId: required('Account'),
      fiscalYearId: required('Fiscal year'),
      amount: required('Budget amount'),
    })
  }

  findByFiscalYear(fiscalYearId: string, options: FindOptions = {}): Budget[] {
    return this.query('fiscalYearId == $0', [fiscalYearId], options)
  }

  findByAccount(accountId: string, options: FindOptions = {}): Budget[] {
    return this.query('accountId == $0', [accountId], options)
  }

  findByStatus(status: BudgetStatusValue, options: FindOptions = {}): Budget[] {
    return this.query('status == $0', [status], options)
  }

  findByAccountAndFiscalYear(accountId: string, fiscalYearId: string): Budget | null {
    return this.first('accountId == $0 AND fiscalYearId == $1', [accountId, fiscalYearId])
  }

  findActiveByFiscalYear(fiscalYearId: string, options: FindOptions = {}): Budget[] {
    return this.query('fiscalYearId == $0 AND status == $1', [fiscalYearId, 'active'], options)
  }

  updateSpent(id: string, amount: number): void {
    const existing = this.findByIdIncludingDeleted(id)
    if (!existing) return
    const newSpent = existing.spent + amount
    this.update(id, { spent: newSpent } as Partial<BudgetInput>)
  }
}
