import { WarehouseLocation, type WarehouseLocationInput } from '../models/WarehouseLocation'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class WarehouseLocationRepository extends BaseRepository<WarehouseLocation, WarehouseLocationInput> {
  protected get objectType(): string {
    return 'WarehouseLocation'
  }

  protected get modelClass(): ModelConstructor<WarehouseLocation> {
    return WarehouseLocation
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      warehouseId: required('Warehouse'),
      code: required('Location code'),
      name: required('Location name'),
    })
  }

  findByWarehouse(warehouseId: string, options: FindOptions = {}): WarehouseLocation[] {
    return this.query('warehouseId == $0', [warehouseId], options)
  }

  findActiveByWarehouse(warehouseId: string, options: FindOptions = {}): WarehouseLocation[] {
    return this.query('warehouseId == $0 && isActive == true', [warehouseId], options)
  }
}
