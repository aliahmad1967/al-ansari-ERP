import {
  StockTransfer,
  type StockTransferUpdate,
  type StockTransferStatusValue,
} from '../models/StockTransfer'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class StockTransferRepository extends BaseRepository<StockTransfer, StockTransferUpdate> {
  protected get objectType(): string {
    return 'StockTransfer'
  }

  protected get modelClass(): ModelConstructor<StockTransfer> {
    return StockTransfer
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      code: required('Transfer code'),
      fromWarehouseId: required('Source warehouse'),
      toWarehouseId: required('Destination warehouse'),
    })
  }

  findByStatus(status: StockTransferStatusValue, options: FindOptions = {}): StockTransfer[] {
    return this.query('status == $0', [status], options)
  }

  findByWarehouse(warehouseId: string, options: FindOptions = {}): StockTransfer[] {
    return this.query(
      'fromWarehouseId == $0 || toWarehouseId == $1',
      [warehouseId, warehouseId],
      options,
    )
  }

  findPending(options: FindOptions = {}): StockTransfer[] {
    return this.query('status == $0', ['pending'], options)
  }
}
