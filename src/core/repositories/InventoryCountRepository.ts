import {
  InventoryCount,
  type InventoryCountUpdate,
  type InventoryCountStatusValue,
} from '../models/InventoryCount'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class InventoryCountRepository extends BaseRepository<InventoryCount, InventoryCountUpdate> {
  protected get objectType(): string {
    return 'InventoryCount'
  }

  protected get modelClass(): ModelConstructor<InventoryCount> {
    return InventoryCount
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      code: required('Count code'),
      warehouseId: required('Warehouse'),
      countDate: required('Count date'),
    })
  }

  findByStatus(status: InventoryCountStatusValue, options: FindOptions = {}): InventoryCount[] {
    return this.query('status == $0', [status], options)
  }

  findByWarehouse(warehouseId: string, options: FindOptions = {}): InventoryCount[] {
    return this.query('warehouseId == $0', [warehouseId], options)
  }

  findLatestByWarehouse(warehouseId: string): InventoryCount | null {
    return this.first('warehouseId == $0', [warehouseId], {
      sortBy: 'countDate',
      sortAscending: false,
    })
  }
}
