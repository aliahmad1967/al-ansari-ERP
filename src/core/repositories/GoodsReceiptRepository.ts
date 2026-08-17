import {
  GoodsReceipt,
  type GoodsReceiptInput,
  type GoodsReceiptStatusValue,
} from '../models/GoodsReceipt'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class GoodsReceiptRepository extends BaseRepository<GoodsReceipt, GoodsReceiptInput> {
  protected get objectType(): string {
    return 'GoodsReceipt'
  }

  protected get modelClass(): ModelConstructor<GoodsReceipt> {
    return GoodsReceipt
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      code: required('Receipt code'),
      receiptDate: required('Receipt date'),
      purchaseOrderId: required('Purchase order'),
      supplierId: required('Supplier'),
      warehouseId: required('Warehouse'),
    })
  }

  findByStatus(status: GoodsReceiptStatusValue, options: FindOptions = {}): GoodsReceipt[] {
    return this.query('status == $0', [status], options)
  }

  findByOrder(purchaseOrderId: string, options: FindOptions = {}): GoodsReceipt[] {
    return this.query('purchaseOrderId == $0', [purchaseOrderId], options)
  }

  findBySupplier(supplierId: string, options: FindOptions = {}): GoodsReceipt[] {
    return this.query('supplierId == $0', [supplierId], options)
  }

  findByWarehouse(warehouseId: string, options: FindOptions = {}): GoodsReceipt[] {
    return this.query('warehouseId == $0', [warehouseId], options)
  }
}
