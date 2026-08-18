import { AccountingReceipt, type AccountingReceiptInput, type AccountingReceiptStatusValue } from '../models/AccountingReceipt'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class AccountingReceiptRepository extends BaseRepository<AccountingReceipt, AccountingReceiptInput> {
  protected get objectType(): string {
    return 'AccountingReceipt'
  }

  protected get modelClass(): ModelConstructor<AccountingReceipt> {
    return AccountingReceipt
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      code: required('Receipt code'),
      receiptDate: required('Receipt date'),
      accountId: required('Account'),
      amount: required('Amount'),
      receiptMethod: required('Receipt method'),
      description: required('Description'),
    })
  }

  findByCode(code: string): AccountingReceipt | null {
    return this.first('code == $0', [code])
  }

  findByStatus(status: AccountingReceiptStatusValue, options: FindOptions = {}): AccountingReceipt[] {
    return this.query('status == $0', [status], options)
  }

  findByDateRange(startDate: Date, endDate: Date, options: FindOptions = {}): AccountingReceipt[] {
    return this.query('receiptDate >= $0 AND receiptDate <= $1', [startDate, endDate], options)
  }

  findByAccount(accountId: string, options: FindOptions = {}): AccountingReceipt[] {
    return this.query('accountId == $0', [accountId], options)
  }

  findByReference(referenceType: string, referenceId: string): AccountingReceipt | null {
    return this.first('referenceType == $0 AND referenceId == $1', [referenceType, referenceId])
  }

  search(query: string, options: FindOptions = {}): AccountingReceipt[] {
    const byDescription = this.query('description CONTAINS[c] $0', [query], options)
    const byCode = this.query('code CONTAINS[c] $0', [query], options)
    const byPayer = this.query('payerName CONTAINS[c] $0 OR payerNameAr CONTAINS[c] $0', [query], options)
    const ids = new Set<string>()
    const result: AccountingReceipt[] = []
    for (const item of [...byCode, ...byDescription, ...byPayer]) {
      if (!ids.has(item._id)) {
        ids.add(item._id)
        result.push(item)
      }
    }
    return result
  }
}
