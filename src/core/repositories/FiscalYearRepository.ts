import { FiscalYear, type FiscalYearInput, type FiscalYearStatusValue } from '../models/FiscalYear'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class FiscalYearRepository extends BaseRepository<FiscalYear, FiscalYearInput> {
  protected get objectType(): string {
    return 'FiscalYear'
  }

  protected get modelClass(): ModelConstructor<FiscalYear> {
    return FiscalYear
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      code: required('Fiscal year code'),
      name: required('Fiscal year name'),
    })
  }

  findByCode(code: string): FiscalYear | null {
    return this.first('code == $0', [code])
  }

  findByStatus(status: FiscalYearStatusValue, options: FindOptions = {}): FiscalYear[] {
    return this.query('status == $0', [status], options)
  }

  findOpen(options: FindOptions = {}): FiscalYear[] {
    return this.query('status == $0', ['open'], options)
  }

  findByDateRange(startDate: Date, endDate: Date, options: FindOptions = {}): FiscalYear[] {
    return this.query('startDate <= $0 AND endDate >= $1', [startDate, endDate], options)
  }

  search(query: string, options: FindOptions = {}): FiscalYear[] {
    const byName = this.query('name CONTAINS[c] $0 OR nameAr CONTAINS[c] $0', [query], options)
    const byCode = this.query('code CONTAINS[c] $0', [query], options)
    const ids = new Set<string>()
    const result: FiscalYear[] = []
    for (const item of [...byCode, ...byName]) {
      if (!ids.has(item._id)) {
        ids.add(item._id)
        result.push(item)
      }
    }
    return result
  }
}
