import { EmployeeSalary, type EmployeeSalaryInput, type EmployeeSalaryStatusValue } from '../models/EmployeeSalary'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class EmployeeSalaryRepository extends BaseRepository<EmployeeSalary, EmployeeSalaryInput> {
  protected get objectType(): string {
    return 'EmployeeSalary'
  }

  protected get modelClass(): ModelConstructor<EmployeeSalary> {
    return EmployeeSalary
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      employeeId: required('Employee'),
      structureId: required('Salary structure'),
      basicSalary: required('Basic salary'),
      effectiveFrom: required('Effective from date'),
    })
  }

  findByEmployee(employeeId: string, options: FindOptions = {}): EmployeeSalary[] {
    return this.query('employeeId == $0', [employeeId], options)
  }

  findActiveByEmployee(employeeId: string, options: FindOptions = {}): EmployeeSalary | null {
    return this.first('employeeId == $0 && status == $1', [employeeId, 'active'], options)
  }

  findByStructure(structureId: string, options: FindOptions = {}): EmployeeSalary[] {
    return this.query('structureId == $0', [structureId], options)
  }

  findActive(options: FindOptions = {}): EmployeeSalary[] {
    return this.query('status == $0', ['active'], options)
  }

  findByStatus(status: EmployeeSalaryStatusValue, options: FindOptions = {}): EmployeeSalary[] {
    return this.query('status == $0', [status], options)
  }

  findActiveForPeriod(startDate: Date, endDate: Date, options: FindOptions = {}): EmployeeSalary[] {
    return this.query(
      'status == $0 && effectiveFrom <= $1 && (effectiveTo == null || effectiveTo >= $2)',
      ['active', endDate, startDate],
      options,
    )
  }
}
