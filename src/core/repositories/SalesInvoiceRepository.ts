import { SalesInvoice, type SalesInvoiceInput, type SalesInvoiceStatusValue } from '../models/SalesInvoice'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class SalesInvoiceRepository extends BaseRepository<SalesInvoice, SalesInvoiceInput> {
  protected get objectType(): string {
    return 'SalesInvoice'
  }

  protected get modelClass(): ModelConstructor<SalesInvoice> {
    return SalesInvoice
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      code: required('Invoice code'),
      customerId: required('Customer'),
    })
  }

  findByStatus(status: SalesInvoiceStatusValue, options: FindOptions = {}): SalesInvoice[] {
    return this.query('status == $0', [status], options)
  }

  findByCustomer(customerId: string, options: FindOptions = {}): SalesInvoice[] {
    return this.query('customerId == $0', [customerId], options)
  }

  findBySalesOrder(salesOrderId: string, options: FindOptions = {}): SalesInvoice[] {
    return this.query('salesOrderId == $0', [salesOrderId], options)
  }

  findOverdue(options: FindOptions = {}): SalesInvoice[] {
    return this.query(
      'status == $0 AND dueDate < $1',
      ['finalized', new Date()],
      options,
    )
  }

  search(query: string, options: FindOptions = {}): SalesInvoice[] {
    return this.query(
      'code CONTAINS[c] $0 OR referenceNumber CONTAINS[c] $0',
      [query],
      options,
    )
  }
}
