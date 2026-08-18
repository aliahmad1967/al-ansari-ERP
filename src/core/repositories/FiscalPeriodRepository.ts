import { FiscalPeriod, type FiscalPeriodInput, type FiscalPeriodStatusValue } from '../models/FiscalPeriod'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class FiscalPeriodRepository extends BaseRepository<FiscalPeriod, FiscalPeriodInput> {
  protected get objectType(): string {
    return 'FiscalPeriod'
  }

  protected get modelClass(): ModelConstructor<FiscalPeriod> {
    return FiscalPeriod
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      fiscalYearId: required('Fiscal year'),
      code: required('Period code'),
      name: required('Period name'),
    })
  }

  findByFiscalYear(fiscalYearId: string, options: FindOptions = {}): FiscalPeriod[] {
    return this.query('fiscalYearId == $0', [fiscalYearId], options)
  }

  findByStatus(status: FiscalPeriodStatusValue, options: FindOptions = {}): FiscalPeriod[] {
    return this.query('status == $0', [status], options)
  }

  findOpenByFiscalYear(fiscalYearId: string, options: FindOptions = {}): FiscalPeriod[] {
    return this.query('fiscalYearId == $0 AND status == $1', [fiscalYearId, 'open'], options)
  }

  findByDate(date: Date, fiscalYearId?: string): FiscalPeriod | null {
    if (fiscalYearId) {
      return this.first('startDate <= $0 AND endDate >= $1 AND fiscalYearId == $2', [date, date, fiscalYearId])
    }
    return this.first('startDate <= $0 AND endDate >= $1', [date, date])
  }

  search(query: string, options: FindOptions = {}): FiscalPeriod[] {
    const byName = this.query('name CONTAINS[c] $0 OR nameAr CONTAINS[c] $0', [query], options)
    const byCode = this.query('code CONTAINS[c] $0', [query], options)
    const ids = new Set<string>()
    const result: FiscalPeriod[] = []
    for (const item of [...byCode, ...byName]) {
      if (!ids.has(item._id)) {
        ids.add(item._id)
        result.push(item)
      }
    }
    return result
  }
}
