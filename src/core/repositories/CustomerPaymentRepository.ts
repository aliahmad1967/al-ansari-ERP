import {
  CustomerPayment,
  type CustomerPaymentInput,
  type CustomerPaymentStatusValue,
} from '../models/CustomerPayment'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class CustomerPaymentRepository extends BaseRepository<CustomerPayment, CustomerPaymentInput> {
  protected get objectType(): string {
    return 'CustomerPayment'
  }

  protected get modelClass(): ModelConstructor<CustomerPayment> {
    return CustomerPayment
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      code: required('Payment code'),
      salesInvoiceId: required('Sales invoice'),
      customerId: required('Customer'),
      amount: required('Amount'),
    })
  }

  findByStatus(status: CustomerPaymentStatusValue, options: FindOptions = {}): CustomerPayment[] {
    return this.query('status == $0', [status], options)
  }

  findByInvoice(salesInvoiceId: string, options: FindOptions = {}): CustomerPayment[] {
    return this.query('salesInvoiceId == $0', [salesInvoiceId], options)
  }

  findByCustomer(customerId: string, options: FindOptions = {}): CustomerPayment[] {
    return this.query('customerId == $0', [customerId], options)
  }

  search(query: string, options: FindOptions = {}): CustomerPayment[] {
    return this.query(
      'code CONTAINS[c] $0 OR referenceNumber CONTAINS[c] $0',
      [query],
      options,
    )
  }
}
