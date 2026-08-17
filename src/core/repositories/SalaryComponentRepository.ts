import { SalaryComponent, type SalaryComponentInput } from '../models/SalaryComponent'
import { combineValidators, maxLength, required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class SalaryComponentRepository extends BaseRepository<SalaryComponent, SalaryComponentInput> {
  protected get objectType(): string {
    return 'SalaryComponent'
  }

  protected get modelClass(): ModelConstructor<SalaryComponent> {
    return SalaryComponent
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    const issues = this.validateFields(values)
    const exceptId = typeof values['_id'] === 'string' ? values['_id'] : undefined
    if (typeof values['code'] === 'string' && this.existsByCode(values['code'], exceptId)) {
      issues.push({ field: 'code', message: 'Component code is already in use.' })
    }
    return issues
  }

  protected validateUpdate(values: Record<string, unknown>): ValidationIssue[] {
    return this.validateFields(values)
  }

  private validateFields(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      structureId: required('Structure'),
      code: combineValidators(required('Component code'), maxLength('Component code', 32)),
      name: required('Component name'),
      type: required('Component type'),
      calculationType: required('Calculation type'),
    })
  }

  private existsByCode(code: string, exceptId?: string): boolean {
    const results = this.getRealm().objects(SalaryComponent).filtered('code == $0', code)
    for (const candidate of results) {
      if (candidate._id !== exceptId && !this.isSoftDeleted(candidate)) return true
    }
    return false
  }

  findByStructure(structureId: string, options: FindOptions = {}): SalaryComponent[] {
    return this.query('structureId == $0', [structureId], { ...options, sortBy: 'sortOrder', sortAscending: true })
  }

  findActiveByStructure(structureId: string, options: FindOptions = {}): SalaryComponent[] {
    return this.query('structureId == $0 && isActive == true', [structureId], { ...options, sortBy: 'sortOrder', sortAscending: true })
  }
}
