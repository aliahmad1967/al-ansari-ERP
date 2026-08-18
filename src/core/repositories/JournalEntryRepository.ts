import { JournalEntry, type JournalEntryInput, type JournalEntryStatusValue } from '../models/JournalEntry'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class JournalEntryRepository extends BaseRepository<JournalEntry, JournalEntryInput> {
  protected get objectType(): string {
    return 'JournalEntry'
  }

  protected get modelClass(): ModelConstructor<JournalEntry> {
    return JournalEntry
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      code: required('Entry code'),
      entryDate: required('Entry date'),
      fiscalYearId: required('Fiscal year'),
      fiscalPeriodId: required('Fiscal period'),
      description: required('Description'),
    })
  }

  findByCode(code: string): JournalEntry | null {
    return this.first('code == $0', [code])
  }

  findByStatus(status: JournalEntryStatusValue, options: FindOptions = {}): JournalEntry[] {
    return this.query('status == $0', [status], options)
  }

  findByFiscalYear(fiscalYearId: string, options: FindOptions = {}): JournalEntry[] {
    return this.query('fiscalYearId == $0', [fiscalYearId], options)
  }

  findByFiscalPeriod(fiscalPeriodId: string, options: FindOptions = {}): JournalEntry[] {
    return this.query('fiscalPeriodId == $0', [fiscalPeriodId], options)
  }

  findByReference(referenceType: string, referenceId: string): JournalEntry | null {
    return this.first('referenceType == $0 AND referenceId == $1', [referenceType, referenceId])
  }

  findByDateRange(startDate: Date, endDate: Date, options: FindOptions = {}): JournalEntry[] {
    return this.query('entryDate >= $0 AND entryDate <= $1', [startDate, endDate], options)
  }

  findReversals(originalEntryId: string, options: FindOptions = {}): JournalEntry[] {
    return this.query('reversalOfId == $0', [originalEntryId], options)
  }

  search(query: string, options: FindOptions = {}): JournalEntry[] {
    const byDescription = this.query('description CONTAINS[c] $0', [query], options)
    const byCode = this.query('code CONTAINS[c] $0', [query], options)
    const byRefNumber = this.query('referenceNumber CONTAINS[c] $0', [query], options)
    const ids = new Set<string>()
    const result: JournalEntry[] = []
    for (const item of [...byCode, ...byDescription, ...byRefNumber]) {
      if (!ids.has(item._id)) {
        ids.add(item._id)
        result.push(item)
      }
    }
    return result
  }
}
