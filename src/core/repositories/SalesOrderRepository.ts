import { SalesOrder, type SalesOrderInput, type SalesOrderStatusValue } from '../models/SalesOrder'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class SalesOrderRepository extends BaseRepository<SalesOrder, SalesOrderInput> {
  protected get objectType(): string {
    return 'SalesOrder'
  }

  protected get modelClass(): ModelConstructor<SalesOrder> {
    return SalesOrder
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      code: required('Sales order code'),
      customerId: required('Customer'),
    })
  }

  findByStatus(status: SalesOrderStatusValue, options: FindOptions = {}): SalesOrder[] {
    return this.query('status == $0', [status], options)
  }

  findByCustomer(customerId: string, options: FindOptions = {}): SalesOrder[] {
    return this.query('customerId == $0', [customerId], options)
  }

  findByQuotation(quotationId: string, options: FindOptions = {}): SalesOrder[] {
    return this.query('quotationId == $0', [quotationId], options)
  }

  search(query: string, options: FindOptions = {}): SalesOrder[] {
    return this.query(
      'code CONTAINS[c] $0 OR referenceNumber CONTAINS[c] $0',
      [query],
      options,
    )
  }
}
