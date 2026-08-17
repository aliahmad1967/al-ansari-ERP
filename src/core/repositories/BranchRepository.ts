/**
 * BranchRepository — persistence for {@link Branch} locations.
 */

import { Branch, type BranchInput, type BranchStatusValue } from '../models/Branch'
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

export class BranchRepository extends BaseRepository<Branch, BranchInput> {
  protected get objectType(): string {
    return 'Branch'
  }

  protected get modelClass(): ModelConstructor<Branch> {
    return Branch
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    const issues = this.validateBranchFields(values)
    if (!values['organization']) {
      issues.push({ field: 'organization', message: 'A parent organization is required.' })
    }
    return issues
  }

  protected validateUpdate(values: Record<string, unknown>): ValidationIssue[] {
    return this.validateBranchFields(values)
  }

  private validateBranchFields(values: Record<string, unknown>): ValidationIssue[] {
    const issues = validateFields(values, {
      code: combineValidators(
        required('Branch code'),
        minLength('Branch code', 2),
        maxLength('Branch code', 32),
      ),
      name: required('Branch name'),
      email: email('Branch email'),
    })
    const exceptId = typeof values['_id'] === 'string' ? values['_id'] : undefined
    if (typeof values['code'] === 'string' && this.existsByCode(values['code'], exceptId)) {
      issues.push({ field: 'code', message: 'Branch code is already in use.' })
    }
    return issues
  }

  private existsByCode(code: string, exceptId?: string): boolean {
    const results = this.getRealm().objects(Branch).filtered('code == $0', code)
    for (const candidate of results) {
      if (candidate._id !== exceptId && !this.isSoftDeleted(candidate)) return true
    }
    return false
  }

  findByCode(code: string, options: FindOptions = {}): Branch | null {
    return this.first('code == $0', [code], options)
  }

  findByOrganization(organizationId: string, options: FindOptions = {}): Branch[] {
    return this.query('organization._id == $0', [organizationId], options)
  }

  findByStatus(status: BranchStatusValue, options: FindOptions = {}): Branch[] {
    return this.query('status == $0', [status], options)
  }
}
