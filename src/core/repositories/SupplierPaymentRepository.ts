import {
  SupplierPayment,
  type SupplierPaymentInput,
  type SupplierPaymentStatusValue,
} from '../models/SupplierPayment'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class SupplierPaymentRepository extends BaseRepository<SupplierPayment, SupplierPaymentInput> {
  protected get objectType(): string {
    return 'SupplierPayment'
  }

  protected get modelClass(): ModelConstructor<SupplierPayment> {
    return SupplierPayment
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      code: required('Payment code'),
      paymentDate: required('Payment date'),
      supplierInvoiceId: required('Supplier invoice'),
      supplierId: required('Supplier'),
      amount: required('Amount'),
      paymentMethod: required('Payment method'),
    })
  }

  findByStatus(status: SupplierPaymentStatusValue, options: FindOptions = {}): SupplierPayment[] {
    return this.query('status == $0', [status], options)
  }

  findByInvoice(supplierInvoiceId: string, options: FindOptions = {}): SupplierPayment[] {
    return this.query('supplierInvoiceId == $0', [supplierInvoiceId], options)
  }

  findBySupplier(supplierId: string, options: FindOptions = {}): SupplierPayment[] {
    return this.query('supplierId == $0', [supplierId], options)
  }
}
