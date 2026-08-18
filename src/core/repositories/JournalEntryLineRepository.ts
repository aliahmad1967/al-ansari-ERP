import { JournalEntryLine, type JournalEntryLineInput } from '../models/JournalEntryLine'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class JournalEntryLineRepository extends BaseRepository<JournalEntryLine, JournalEntryLineInput> {
  protected get objectType(): string {
    return 'JournalEntryLine'
  }

  protected get modelClass(): ModelConstructor<JournalEntryLine> {
    return JournalEntryLine
  }

  protected get supportsSoftDelete(): boolean {
    return false
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      journalEntryId: required('Journal entry'),
      accountId: required('Account'),
    })
  }

  findByJournalEntry(journalEntryId: string, options: FindOptions = {}): JournalEntryLine[] {
    return this.query('journalEntryId == $0', [journalEntryId], options)
  }

  findByAccount(accountId: string, options: FindOptions = {}): JournalEntryLine[] {
    return this.query('accountId == $0', [accountId], options)
  }

  findByCostCenter(costCenterId: string, options: FindOptions = {}): JournalEntryLine[] {
    return this.query('costCenterId == $0', [costCenterId], options)
  }

  findByCustomer(customerId: string, options: FindOptions = {}): JournalEntryLine[] {
    return this.query('customerId == $0', [customerId], options)
  }

  findBySupplier(supplierId: string, options: FindOptions = {}): JournalEntryLine[] {
    return this.query('supplierId == $0', [supplierId], options)
  }

  deleteByJournalEntry(journalEntryId: string): number {
    const lines = this.findByJournalEntry(journalEntryId)
    const count = lines.length
    if (count > 0) {
      const realm = this.getRealm()
      const { withTransaction } = require('../database/transactions')
      withTransaction(realm, () => {
        realm.delete(lines)
      })
    }
    return count
  }
}
