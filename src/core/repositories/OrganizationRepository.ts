/**
 * OrganizationRepository — persistence for {@link Organization} tenants.
 */

import { Branch } from '../models/Branch'
import { Organization, type OrganizationInput } from '../models/Organization'
import {
  combineValidators,
  email,
  maxLength,
  minLength,
  required,
  validateFields,
  type ValidationIssue,
} from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class OrganizationRepository extends BaseRepository<Organization, OrganizationInput> {
  protected get objectType(): string {
    return 'Organization'
  }

  protected get modelClass(): ModelConstructor<Organization> {
    return Organization
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return this.validateOrganizationFields(values)
  }

  protected validateUpdate(values: Record<string, unknown>): ValidationIssue[] {
    return this.validateOrganizationFields(values)
  }

  private validateOrganizationFields(values: Record<string, unknown>): ValidationIssue[] {
    const issues = validateFields(values, {
      code: combineValidators(
        required('Organization code'),
        minLength('Organization code', 2),
        maxLength('Organization code', 32),
      ),
      name: required('Organization name'),
      email: email('Organization email'),
    })
    const exceptId = typeof values['_id'] === 'string' ? values['_id'] : undefined
    if (typeof values['code'] === 'string' && this.existsByCode(values['code'], exceptId)) {
      issues.push({ field: 'code', message: 'Organization code is already in use.' })
    }
    return issues
  }

  private existsByCode(code: string, exceptId?: string): boolean {
    const results = this.getRealm().objects(Organization).filtered('code == $0', code)
    for (const candidate of results) {
      if (candidate._id !== exceptId && !this.isSoftDeleted(candidate)) return true
    }
    return false
  }

  findByCode(code: string, options: FindOptions = {}): Organization | null {
    return this.first('code == $0', [code], options)
  }

  findByName(name: string, options: FindOptions = {}): Organization | null {
    return this.first('name == $0', [name], options)
  }

  /** The first active organization (used as the app tenant). */
  getDefault(options: FindOptions = {}): Organization | null {
    return this.first('status == $0', ['active'], options)
  }

  /** Branches belonging to an organization, newest first. */
  findBranches(organizationId: string, options: FindOptions = {}): Branch[] {
    const realm = this.getRealm()
    let results = realm.objects(Branch).filtered('organization._id == $0', organizationId)
    if (!options.includeDeleted) {
      results = results.filtered('isDeleted == false')
    }
    results = results.sorted('createdAt', false)
    return Array.from(results)
  }

  /** Count of active, non-deleted organizations. */
  countActive(): number {
    return this.countQuery('status == $0', ['active'])
  }
}
