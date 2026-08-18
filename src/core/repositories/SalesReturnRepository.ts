import { SalesReturn, type SalesReturnInput, type SalesReturnStatusValue } from '../models/SalesReturn'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class SalesReturnRepository extends BaseRepository<SalesReturn, SalesReturnInput> {
  protected get objectType(): string {
    return 'SalesReturn'
  }

  protected get modelClass(): ModelConstructor<SalesReturn> {
    return SalesReturn
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      code: required('Return code'),
      salesInvoiceId: required('Sales invoice'),
      customerId: required('Customer'),
      warehouseId: required('Warehouse'),
      reason: required('Reason'),
    })
  }

  findByStatus(status: SalesReturnStatusValue, options: FindOptions = {}): SalesReturn[] {
    return this.query('status == $0', [status], options)
  }

  findByCustomer(customerId: string, options: FindOptions = {}): SalesReturn[] {
    return this.query('customerId == $0', [customerId], options)
  }

  findByInvoice(salesInvoiceId: string, options: FindOptions = {}): SalesReturn[] {
    return this.query('salesInvoiceId == $0', [salesInvoiceId], options)
  }

  search(query: string, options: FindOptions = {}): SalesReturn[] {
    return this.query('code CONTAINS[c] $0', [query], options)
  }
}
