import { Unit, type UnitInput } from '../models/Unit'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class UnitRepository extends BaseRepository<Unit, UnitInput> {
  protected get objectType(): string {
    return 'Unit'
  }

  protected get modelClass(): ModelConstructor<Unit> {
    return Unit
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      code: required('Unit code'),
      name: required('Unit name'),
    })
  }

  findActive(options: FindOptions = {}): Unit[] {
    return this.query('isActive == true', [], options)
  }

  findByBaseUnit(baseUnitId: string, options: FindOptions = {}): Unit[] {
    return this.query('baseUnitId == $0', [baseUnitId], options)
  }
}
