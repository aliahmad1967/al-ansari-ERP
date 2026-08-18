import { LedgerTransaction, type LedgerTransactionInput } from '../models/LedgerTransaction'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class LedgerTransactionRepository extends BaseRepository<LedgerTransaction, LedgerTransactionInput> {
  protected get objectType(): string {
    return 'LedgerTransaction'
  }

  protected get modelClass(): ModelConstructor<LedgerTransaction> {
    return LedgerTransaction
  }

  protected get supportsSoftDelete(): boolean {
    return false
  }

  findByAccount(accountId: string, options: FindOptions = {}): LedgerTransaction[] {
    return this.query('accountId == $0', [accountId], options)
  }

  findByJournalEntry(journalEntryId: string, options: FindOptions = {}): LedgerTransaction[] {
    return this.query('journalEntryId == $0', [journalEntryId], options)
  }

  findByFiscalYear(fiscalYearId: string, options: FindOptions = {}): LedgerTransaction[] {
    return this.query('fiscalYearId == $0', [fiscalYearId], options)
  }

  findByFiscalPeriod(fiscalPeriodId: string, options: FindOptions = {}): LedgerTransaction[] {
    return this.query('fiscalPeriodId == $0', [fiscalPeriodId], options)
  }

  findByDateRange(startDate: Date, endDate: Date, options: FindOptions = {}): LedgerTransaction[] {
    return this.query('entryDate >= $0 AND entryDate <= $1', [startDate, endDate], options)
  }

  findByAccountAndPeriod(accountId: string, fiscalPeriodId: string, options: FindOptions = {}): LedgerTransaction[] {
    return this.query('accountId == $0 AND fiscalPeriodId == $1', [accountId, fiscalPeriodId], options)
  }

  findByCostCenter(costCenterId: string, options: FindOptions = {}): LedgerTransaction[] {
    return this.query('costCenterId == $0', [costCenterId], options)
  }

  findByCustomer(customerId: string, options: FindOptions = {}): LedgerTransaction[] {
    return this.query('customerId == $0', [customerId], options)
  }

  findBySupplier(supplierId: string, options: FindOptions = {}): LedgerTransaction[] {
    return this.query('supplierId == $0', [supplierId], options)
  }

  findLastByAccount(accountId: string): LedgerTransaction | null {
    const results = this.query('accountId == $0', [accountId], { sortBy: 'entryDate', sortAscending: false, limit: 1 })
    return results[0] ?? null
  }
}
