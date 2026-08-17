import { SalaryStructure, type SalaryStructureInput } from '../models/SalaryStructure'
import { combineValidators, maxLength, required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class SalaryStructureRepository extends BaseRepository<SalaryStructure, SalaryStructureInput> {
  protected get objectType(): string {
    return 'SalaryStructure'
  }

  protected get modelClass(): ModelConstructor<SalaryStructure> {
    return SalaryStructure
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    const issues = this.validateFields(values)
    const exceptId = typeof values['_id'] === 'string' ? values['_id'] : undefined
    if (typeof values['code'] === 'string' && this.existsByCode(values['code'], exceptId)) {
      issues.push({ field: 'code', message: 'Structure code is already in use.' })
    }
    return issues
  }

  protected validateUpdate(values: Record<string, unknown>): ValidationIssue[] {
    return this.validateFields(values)
  }

  private validateFields(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      code: combineValidators(required('Structure code'), maxLength('Structure code', 32)),
      name: required('Structure name'),
    })
  }

  private existsByCode(code: string, exceptId?: string): boolean {
    const results = this.getRealm().objects(SalaryStructure).filtered('code == $0', code)
    for (const candidate of results) {
      if (candidate._id !== exceptId && !this.isSoftDeleted(candidate)) return true
    }
    return false
  }

  findByCode(code: string, options: FindOptions = {}): SalaryStructure | null {
    return this.first('code == $0', [code], options)
  }

  findActive(options: FindOptions = {}): SalaryStructure[] {
    return this.query('isActive == true', [], options)
  }

  findDefault(options: FindOptions = {}): SalaryStructure | null {
    return this.first('isDefault == true && isActive == true', [], options)
  }
}
