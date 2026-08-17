import { Warehouse, type WarehouseInput } from '../models/Warehouse'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class WarehouseRepository extends BaseRepository<Warehouse, WarehouseInput> {
  protected get objectType(): string {
    return 'Warehouse'
  }

  protected get modelClass(): ModelConstructor<Warehouse> {
    return Warehouse
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      code: required('Warehouse code'),
      name: required('Warehouse name'),
    })
  }

  findActive(options: FindOptions = {}): Warehouse[] {
    return this.query('isActive == true', [], options)
  }
}
