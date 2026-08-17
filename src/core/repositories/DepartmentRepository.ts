/**
 * DepartmentRepository — persistence for {@link Department} units.
 */

import { Department, type DepartmentInput } from '../models/Department'
import {
  combineValidators,
  maxLength,
  minLength,
  required,
  validateFields,
  type ValidationIssue,
} from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class DepartmentRepository extends BaseRepository<Department, DepartmentInput> {
  protected get objectType(): string {
    return 'Department'
  }

  protected get modelClass(): ModelConstructor<Department> {
    return Department
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    const issues = this.validateDepartmentFields(values)
    if (!values['branch']) {
      issues.push({ field: 'branch', message: 'A parent branch is required.' })
    }
    return issues
  }

  protected validateUpdate(values: Record<string, unknown>): ValidationIssue[] {
    return this.validateDepartmentFields(values)
  }

  private validateDepartmentFields(values: Record<string, unknown>): ValidationIssue[] {
    const issues = validateFields(values, {
      code: combineValidators(
        required('Department code'),
        minLength('Department code', 2),
        maxLength('Department code', 32),
      ),
      name: required('Department name'),
    })
    const exceptId = typeof values['_id'] === 'string' ? values['_id'] : undefined
    if (typeof values['code'] === 'string' && this.existsByCode(values['code'], exceptId)) {
      issues.push({ field: 'code', message: 'Department code is already in use.' })
    }
    return issues
  }

  private existsByCode(code: string, exceptId?: string): boolean {
    const results = this.getRealm().objects(Department).filtered('code == $0', code)
    for (const candidate of results) {
      if (candidate._id !== exceptId && !this.isSoftDeleted(candidate)) return true
    }
    return false
  }

  findByCode(code: string, options: FindOptions = {}): Department | null {
    return this.first('code == $0', [code], options)
  }

  findByBranch(branchId: string, options: FindOptions = {}): Department[] {
    return this.query('branch._id == $0', [branchId], options)
  }

  findByManager(managerId: string, options: FindOptions = {}): Department[] {
    return this.query('manager._id == $0', [managerId], options)
  }
}
