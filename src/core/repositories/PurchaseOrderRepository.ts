import {
  PurchaseOrder,
  type PurchaseOrderInput,
  type PurchaseOrderStatusValue,
} from '../models/PurchaseOrder'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class PurchaseOrderRepository extends BaseRepository<PurchaseOrder, PurchaseOrderInput> {
  protected get objectType(): string {
    return 'PurchaseOrder'
  }

  protected get modelClass(): ModelConstructor<PurchaseOrder> {
    return PurchaseOrder
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      code: required('Order code'),
      orderDate: required('Order date'),
      supplierId: required('Supplier'),
    })
  }

  findByStatus(status: PurchaseOrderStatusValue, options: FindOptions = {}): PurchaseOrder[] {
    return this.query('status == $0', [status], options)
  }

  findBySupplier(supplierId: string, options: FindOptions = {}): PurchaseOrder[] {
    return this.query('supplierId == $0', [supplierId], options)
  }

  findByRequest(purchaseRequestId: string, options: FindOptions = {}): PurchaseOrder[] {
    return this.query('purchaseRequestId == $0', [purchaseRequestId], options)
  }

  findPending(options: FindOptions = {}): PurchaseOrder[] {
    return this.query('status == $0', ['pending'], options)
  }
}
