/**
 * PositionRepository — persistence for {@link Position} records.
 */

import { Position, type PositionInput } from '../models/Position'
import {
  combineValidators,
  maxLength,
  minLength,
  required,
  validateFields,
  type ValidationIssue,
} from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class PositionRepository extends BaseRepository<Position, PositionInput> {
  protected get objectType(): string {
    return 'Position'
  }

  protected get modelClass(): ModelConstructor<Position> {
    return Position
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    const issues = this.validatePositionFields(values)
    if (!values['department']) {
      issues.push({ field: 'department', message: 'A parent department is required.' })
    }
    return issues
  }

  protected validateUpdate(values: Record<string, unknown>): ValidationIssue[] {
    return this.validatePositionFields(values)
  }

  private validatePositionFields(values: Record<string, unknown>): ValidationIssue[] {
    const issues = validateFields(values, {
      code: combineValidators(
        required('Position code'),
        minLength('Position code', 2),
        maxLength('Position code', 32),
      ),
      title: required('Position title'),
    })
    const exceptId = typeof values['_id'] === 'string' ? values['_id'] : undefined
    if (typeof values['code'] === 'string' && this.existsByCode(values['code'], exceptId)) {
      issues.push({ field: 'code', message: 'Position code is already in use.' })
    }
    return issues
  }

  private existsByCode(code: string, exceptId?: string): boolean {
    const results = this.getRealm().objects(Position).filtered('code == $0', code)
    for (const candidate of results) {
      if (candidate._id !== exceptId && !this.isSoftDeleted(candidate)) return true
    }
    return false
  }

  findByCode(code: string, options: FindOptions = {}): Position | null {
    return this.first('code == $0', [code], options)
  }

  findByDepartment(departmentId: string, options: FindOptions = {}): Position[] {
    return this.query('department._id == $0', [departmentId], options)
  }
}
