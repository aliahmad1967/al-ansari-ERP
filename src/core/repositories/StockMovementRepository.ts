import {
  StockMovement,
  type StockMovementInput,
  type StockMovementTypeValue,
} from '../models/StockMovement'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class StockMovementRepository extends BaseRepository<StockMovement, StockMovementInput> {
  protected get objectType(): string {
    return 'StockMovement'
  }

  protected get modelClass(): ModelConstructor<StockMovement> {
    return StockMovement
  }

  protected get supportsSoftDelete(): boolean {
    return false
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      type: required('Movement type'),
      productId: required('Product'),
      warehouseId: required('Warehouse'),
      quantity: required('Quantity'),
    })
  }

  findByProduct(productId: string, options: FindOptions = {}): StockMovement[] {
    return this.query('productId == $0', [productId], {
      ...options,
      sortBy: options.sortBy ?? 'createdAt',
      sortAscending: options.sortAscending ?? false,
    })
  }

  findByWarehouse(warehouseId: string, options: FindOptions = {}): StockMovement[] {
    return this.query('warehouseId == $0', [warehouseId], {
      ...options,
      sortBy: options.sortBy ?? 'createdAt',
      sortAscending: options.sortAscending ?? false,
    })
  }

  findByType(type: StockMovementTypeValue, options: FindOptions = {}): StockMovement[] {
    return this.query('type == $0', [type], {
      ...options,
      sortBy: options.sortBy ?? 'createdAt',
      sortAscending: options.sortAscending ?? false,
    })
  }

  findByReference(referenceType: string, referenceId: string, options: FindOptions = {}): StockMovement[] {
    return this.query('referenceType == $0 && referenceId == $1', [referenceType, referenceId], options)
  }

  findByDateRange(start: Date, end: Date, options: FindOptions = {}): StockMovement[] {
    return this.query('createdAt >= $0 && createdAt <= $1', [start, end], {
      ...options,
      sortBy: options.sortBy ?? 'createdAt',
      sortAscending: options.sortAscending ?? false,
    })
  }

  findRecent(limit: number, options: FindOptions = {}): StockMovement[] {
    return this.query(null, [], {
      ...options,
      sortBy: 'createdAt',
      sortAscending: false,
      limit,
    })
  }
}
