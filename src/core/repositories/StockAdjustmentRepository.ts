import {
  StockAdjustment,
  type StockAdjustmentInput,
  type StockAdjustmentStatusValue,
} from '../models/StockAdjustment'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class StockAdjustmentRepository extends BaseRepository<StockAdjustment, StockAdjustmentInput> {
  protected get objectType(): string {
    return 'StockAdjustment'
  }

  protected get modelClass(): ModelConstructor<StockAdjustment> {
    return StockAdjustment
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      code: required('Adjustment code'),
      warehouseId: required('Warehouse'),
      reason: required('Adjustment reason'),
    })
  }

  findByStatus(status: StockAdjustmentStatusValue, options: FindOptions = {}): StockAdjustment[] {
    return this.query('status == $0', [status], options)
  }

  findByWarehouse(warehouseId: string, options: FindOptions = {}): StockAdjustment[] {
    return this.query('warehouseId == $0', [warehouseId], options)
  }
}
