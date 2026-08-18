import { AccountingPayment, type AccountingPaymentInput, type AccountingPaymentStatusValue } from '../models/AccountingPayment'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class AccountingPaymentRepository extends BaseRepository<AccountingPayment, AccountingPaymentInput> {
  protected get objectType(): string {
    return 'AccountingPayment'
  }

  protected get modelClass(): ModelConstructor<AccountingPayment> {
    return AccountingPayment
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      code: required('Payment code'),
      paymentDate: required('Payment date'),
      accountId: required('Account'),
      amount: required('Amount'),
      paymentMethod: required('Payment method'),
      description: required('Description'),
    })
  }

  findByCode(code: string): AccountingPayment | null {
    return this.first('code == $0', [code])
  }

  findByStatus(status: AccountingPaymentStatusValue, options: FindOptions = {}): AccountingPayment[] {
    return this.query('status == $0', [status], options)
  }

  findByDateRange(startDate: Date, endDate: Date, options: FindOptions = {}): AccountingPayment[] {
    return this.query('paymentDate >= $0 AND paymentDate <= $1', [startDate, endDate], options)
  }

  findByAccount(accountId: string, options: FindOptions = {}): AccountingPayment[] {
    return this.query('accountId == $0', [accountId], options)
  }

  findByReference(referenceType: string, referenceId: string): AccountingPayment | null {
    return this.first('referenceType == $0 AND referenceId == $1', [referenceType, referenceId])
  }

  search(query: string, options: FindOptions = {}): AccountingPayment[] {
    const byDescription = this.query('description CONTAINS[c] $0', [query], options)
    const byCode = this.query('code CONTAINS[c] $0', [query], options)
    const byPayee = this.query('payeeName CONTAINS[c] $0 OR payeeNameAr CONTAINS[c] $0', [query], options)
    const ids = new Set<string>()
    const result: AccountingPayment[] = []
    for (const item of [...byCode, ...byDescription, ...byPayee]) {
      if (!ids.has(item._id)) {
        ids.add(item._id)
        result.push(item)
      }
    }
    return result
  }
}
