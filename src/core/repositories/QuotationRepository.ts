import { Quotation, type QuotationInput, type QuotationStatusValue } from '../models/Quotation'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class QuotationRepository extends BaseRepository<Quotation, QuotationInput> {
  protected get objectType(): string {
    return 'Quotation'
  }

  protected get modelClass(): ModelConstructor<Quotation> {
    return Quotation
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      code: required('Quotation code'),
      customerId: required('Customer'),
    })
  }

  findByStatus(status: QuotationStatusValue, options: FindOptions = {}): Quotation[] {
    return this.query('status == $0', [status], options)
  }

  findByCustomer(customerId: string, options: FindOptions = {}): Quotation[] {
    return this.query('customerId == $0', [customerId], options)
  }

  search(query: string, options: FindOptions = {}): Quotation[] {
    return this.query('code CONTAINS[c] $0 OR referenceNumber CONTAINS[c] $0', [query], options)
  }

  findValid(options: FindOptions = {}): Quotation[] {
    return this.query(
      'status == $0 AND validUntilDate >= $1',
      ['sent', new Date()],
      options,
    )
  }

  findExpired(options: FindOptions = {}): Quotation[] {
    return this.query(
      'status == $0 AND validUntilDate < $1',
      ['sent', new Date()],
      options,
    )
  }
}
