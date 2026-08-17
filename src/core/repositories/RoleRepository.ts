/**
 * RoleRepository — persistence for {@link Role} and its permission set.
 */

export { Role, SystemRoleCode, type RoleInput } from '../models/Role'
import { Role, SystemRoleCode, type RoleInput } from '../models/Role'
import {
  combineValidators,
  maxLength,
  minLength,
  required,
  validateFields,
  type ValidationIssue,
} from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class RoleRepository extends BaseRepository<Role, RoleInput> {
  protected get objectType(): string {
    return 'Role'
  }

  protected get modelClass(): ModelConstructor<Role> {
    return Role
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return this.validateRoleFields(values)
  }

  protected validateUpdate(values: Record<string, unknown>): ValidationIssue[] {
    return this.validateRoleFields(values)
  }

  private validateRoleFields(values: Record<string, unknown>): ValidationIssue[] {
    const issues = validateFields(values, {
      code: combineValidators(
        required('Role code'),
        minLength('Role code', 2),
        maxLength('Role code', 64),
      ),
      name: required('Role name'),
    })
    const exceptId = typeof values['_id'] === 'string' ? values['_id'] : undefined
    if (typeof values['code'] === 'string' && this.existsByCode(values['code'], exceptId)) {
      issues.push({ field: 'code', message: 'Role code is already in use.' })
    }
    return issues
  }

  private existsByCode(code: string, exceptId?: string): boolean {
    const results = this.getRealm().objects(Role).filtered('code == $0', code)
    for (const candidate of results) {
      if (candidate._id !== exceptId && !this.isSoftDeleted(candidate)) return true
    }
    return false
  }

  findByCode(code: string, options: FindOptions = {}): Role | null {
    return this.first('code == $0', [code], options)
  }

  findByName(name: string, options: FindOptions = {}): Role | null {
    return this.first('name == $0', [name], options)
  }

  /** Returns all roles that include the given permission code. */
  findByPermissionCode(permissionCode: string, options: FindOptions = {}): Role[] {
    return this.query('permissions.code == $0', [permissionCode], options)
  }

  /** Returns system-protected roles. */
  findSystemRoles(options: FindOptions = {}): Role[] {
    return this.query('isSystem == true', [], options)
  }

  isSystemRole(roleId: string): boolean {
    const role = this.findByIdIncludingDeleted(roleId)
    return role?.isSystem === true
  }

  /** Returns the default system role code for a given code string. */
  getSystemRoleCode(code: string): string | undefined {
    return (Object.values(SystemRoleCode) as string[]).includes(code) ? code : undefined
  }
}
