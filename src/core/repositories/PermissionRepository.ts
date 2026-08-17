/**
 * PermissionRepository — persistence for {@link Permission} capabilities.
 */

import { Permission, type PermissionInput } from '../models/Permission'
import {
  combineValidators,
  maxLength,
  minLength,
  required,
  validateFields,
  type ValidationIssue,
} from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class PermissionRepository extends BaseRepository<Permission, PermissionInput> {
  protected get objectType(): string {
    return 'Permission'
  }

  protected get modelClass(): ModelConstructor<Permission> {
    return Permission
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return this.validatePermissionFields(values)
  }

  protected validateUpdate(values: Record<string, unknown>): ValidationIssue[] {
    return this.validatePermissionFields(values)
  }

  private validatePermissionFields(values: Record<string, unknown>): ValidationIssue[] {
    const issues = validateFields(values, {
      code: combineValidators(
        required('Permission code'),
        minLength('Permission code', 3),
        maxLength('Permission code', 128),
      ),
      name: required('Permission name'),
      module: required('Module'),
      resource: required('Resource'),
      action: required('Action'),
    })
    const exceptId = typeof values['_id'] === 'string' ? values['_id'] : undefined
    if (typeof values['code'] === 'string' && this.existsByCode(values['code'], exceptId)) {
      issues.push({ field: 'code', message: 'Permission code is already in use.' })
    }
    return issues
  }

  private existsByCode(code: string, exceptId?: string): boolean {
    const results = this.getRealm().objects(Permission).filtered('code == $0', code)
    for (const candidate of results) {
      if (candidate._id !== exceptId && !this.isSoftDeleted(candidate)) return true
    }
    return false
  }

  findByCode(code: string, options: FindOptions = {}): Permission | null {
    return this.first('code == $0', [code], options)
  }

  findByModule(module: string, options: FindOptions = {}): Permission[] {
    return this.query('module == $0', [module], options)
  }

  findByModuleAndResource(
    module: string,
    resource: string,
    options: FindOptions = {},
  ): Permission[] {
    return this.query('module == $0 AND resource == $1', [module, resource], options)
  }
}
