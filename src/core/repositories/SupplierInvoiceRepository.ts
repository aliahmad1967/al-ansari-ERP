import {
  SupplierInvoice,
  type SupplierInvoiceUpdate,
  type SupplierInvoiceStatusValue,
} from '../models/SupplierInvoice'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class SupplierInvoiceRepository extends BaseRepository<SupplierInvoice, SupplierInvoiceUpdate> {
  protected get objectType(): string {
    return 'SupplierInvoice'
  }

  protected get modelClass(): ModelConstructor<SupplierInvoice> {
    return SupplierInvoice
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      code: required('Invoice code'),
      invoiceDate: required('Invoice date'),
      supplierId: required('Supplier'),
      purchaseOrderId: required('Purchase order'),
      invoiceNumber: required('Invoice number'),
      totalAmount: required('Total amount'),
      netAmount: required('Net amount'),
      dueDate: required('Due date'),
    })
  }

  findByStatus(status: SupplierInvoiceStatusValue, options: FindOptions = {}): SupplierInvoice[] {
    return this.query('status == $0', [status], options)
  }

  findBySupplier(supplierId: string, options: FindOptions = {}): SupplierInvoice[] {
    return this.query('supplierId == $0', [supplierId], options)
  }

  findByOrder(purchaseOrderId: string, options: FindOptions = {}): SupplierInvoice[] {
    return this.query('purchaseOrderId == $0', [purchaseOrderId], options)
  }

  findOverdue(options: FindOptions = {}): SupplierInvoice[] {
    return this.query(
      'dueDate < $0 && !(status IN $1)',
      [new Date(), ['paid', 'cancelled']],
      options,
    )
  }
}
