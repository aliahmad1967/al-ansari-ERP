import { Employee, type EmployeeInput, type EmployeeStatusValue } from '../models/Employee'
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

export class EmployeeRepository extends BaseRepository<Employee, EmployeeInput> {
  protected get objectType(): string {
    return 'Employee'
  }

  protected get modelClass(): ModelConstructor<Employee> {
    return Employee
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    const issues = this.validateEmployeeFields(values)
    const exceptId = typeof values['_id'] === 'string' ? values['_id'] : undefined
    if (typeof values['employeeNumber'] === 'string' && this.existsByNumber(values['employeeNumber'], exceptId)) {
      issues.push({ field: 'employeeNumber', message: 'Employee number is already in use.' })
    }
    return issues
  }

  protected validateUpdate(values: Record<string, unknown>): ValidationIssue[] {
    return this.validateEmployeeFields(values)
  }

  private validateEmployeeFields(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      employeeNumber: combineValidators(
        required('Employee number'),
        minLength('Employee number', 2),
        maxLength('Employee number', 32),
      ),
      firstName: required('First name'),
      lastName: required('Last name'),
      email: email('Email'),
    })
  }

  private existsByNumber(employeeNumber: string, exceptId?: string): boolean {
    const results = this.getRealm().objects(Employee).filtered('employeeNumber == $0', employeeNumber)
    for (const candidate of results) {
      if (candidate._id !== exceptId && !this.isSoftDeleted(candidate)) return true
    }
    return false
  }

  findByEmployeeNumber(number: string, options: FindOptions = {}): Employee | null {
    return this.first('employeeNumber == $0', [number], options)
  }

  findByDepartment(departmentId: string, options: FindOptions = {}): Employee[] {
    return this.query('departmentId == $0', [departmentId], options)
  }

  findByPosition(positionId: string, options: FindOptions = {}): Employee[] {
    return this.query('positionId == $0', [positionId], options)
  }

  findByManager(managerId: string, options: FindOptions = {}): Employee[] {
    return this.query('managerId == $0', [managerId], options)
  }

  findByStatus(status: EmployeeStatusValue, options: FindOptions = {}): Employee[] {
    return this.query('status == $0', [status], options)
  }

  findByOrganization(organizationId: string, options: FindOptions = {}): Employee[] {
    return this.query('organizationId == $0', [organizationId], options)
  }

  search(query: string, options: FindOptions = {}): Employee[] {
    const q = query.toLowerCase()
    return this.query(
      'firstName CONTAINS[c] $0 || lastName CONTAINS[c] $0 || employeeNumber CONTAINS[c] $0 || email CONTAINS[c] $0',
      [q],
      options,
    )
  }
}
