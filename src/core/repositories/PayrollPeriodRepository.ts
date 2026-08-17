import { PayrollPeriod, type PayrollPeriodInput, type PayrollPeriodStatusValue } from '../models/PayrollPeriod'
import { combineValidators, maxLength, required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class PayrollPeriodRepository extends BaseRepository<PayrollPeriod, PayrollPeriodInput> {
  protected get objectType(): string {
    return 'PayrollPeriod'
  }

  protected get modelClass(): ModelConstructor<PayrollPeriod> {
    return PayrollPeriod
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      name: combineValidators(required('Period name'), maxLength('Period name', 64)),
      startDate: required('Start date'),
      endDate: required('End date'),
      year: required('Year'),
      month: required('Month'),
    })
  }

  findByYearMonth(year: number, month: number, options: FindOptions = {}): PayrollPeriod | null {
    return this.first('year == $0 && month == $1', [year, month], options)
  }

  findByStatus(status: PayrollPeriodStatusValue, options: FindOptions = {}): PayrollPeriod[] {
    return this.query('status == $0', [status], options)
  }

  findOpen(options: FindOptions = {}): PayrollPeriod[] {
    return this.query('status == $0 || status == $1', ['open', 'draft'], { ...options, sortBy: 'startDate', sortAscending: false })
  }

  findLatest(options: FindOptions = {}): PayrollPeriod | null {
    return this.first(null, [], { ...options, sortBy: 'startDate', sortAscending: false })
  }
}
