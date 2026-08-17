import { PayrollRun, type PayrollRunUpdate, type PayrollRunStatusValue } from '../models/PayrollRun'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class PayrollRunRepository extends BaseRepository<PayrollRun, PayrollRunUpdate> {
  protected get objectType(): string {
    return 'PayrollRun'
  }

  protected get modelClass(): ModelConstructor<PayrollRun> {
    return PayrollRun
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      periodId: required('Payroll period'),
    })
  }

  findByPeriod(periodId: string, options: FindOptions = {}): PayrollRun[] {
    return this.query('periodId == $0', [periodId], { ...options, sortBy: 'createdAt', sortAscending: false })
  }

  findByStatus(status: PayrollRunStatusValue, options: FindOptions = {}): PayrollRun[] {
    return this.query('status == $0', [status], options)
  }

  findLatestByPeriod(periodId: string): PayrollRun | null {
    return this.first('periodId == $0', [periodId], { sortBy: 'runNumber', sortAscending: false })
  }

  getNextRunNumber(periodId: string): number {
    const latest = this.findLatestByPeriod(periodId)
    return latest ? latest.runNumber + 1 : 1
  }

  findReversals(runId: string, options: FindOptions = {}): PayrollRun[] {
    return this.query('reversalOfId == $0', [runId], options)
  }
}
