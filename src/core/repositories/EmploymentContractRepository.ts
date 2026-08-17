import { EmploymentContract, type EmploymentContractInput, type ContractStatusValue } from '../models/EmploymentContract'
import {
  combineValidators,
  maxLength,
  required,
  validateFields,
  type ValidationIssue,
} from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class EmploymentContractRepository extends BaseRepository<EmploymentContract, EmploymentContractInput> {
  protected get objectType(): string {
    return 'EmploymentContract'
  }

  protected get modelClass(): ModelConstructor<EmploymentContract> {
    return EmploymentContract
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    const issues = this.validateContractFields(values)
    const exceptId = typeof values['_id'] === 'string' ? values['_id'] : undefined
    if (typeof values['contractNumber'] === 'string' && this.existsByNumber(values['contractNumber'], exceptId)) {
      issues.push({ field: 'contractNumber', message: 'Contract number is already in use.' })
    }
    return issues
  }

  protected validateUpdate(values: Record<string, unknown>): ValidationIssue[] {
    return this.validateContractFields(values)
  }

  private validateContractFields(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      contractNumber: combineValidators(
        required('Contract number'),
        maxLength('Contract number', 32),
      ),
      type: required('Contract type'),
    })
  }

  private existsByNumber(contractNumber: string, exceptId?: string): boolean {
    const results = this.getRealm().objects(EmploymentContract).filtered('contractNumber == $0', contractNumber)
    for (const candidate of results) {
      if (candidate._id !== exceptId && !this.isSoftDeleted(candidate)) return true
    }
    return false
  }

  findByEmployee(employeeId: string, options: FindOptions = {}): EmploymentContract[] {
    return this.query('employeeId == $0', [employeeId], options)
  }

  findActiveByEmployee(employeeId: string, options: FindOptions = {}): EmploymentContract[] {
    return this.query('employeeId == $0 && status == $1', [employeeId, 'active'], options)
  }

  findByStatus(status: ContractStatusValue, options: FindOptions = {}): EmploymentContract[] {
    return this.query('status == $0', [status], options)
  }

  findByContractNumber(number: string, options: FindOptions = {}): EmploymentContract | null {
    return this.first('contractNumber == $0', [number], options)
  }
}
