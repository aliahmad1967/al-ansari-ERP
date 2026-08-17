import { EmployeeSalaryItem, type EmployeeSalaryItemInput } from '../models/EmployeeSalaryItem'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class EmployeeSalaryItemRepository extends BaseRepository<EmployeeSalaryItem, EmployeeSalaryItemInput> {
  protected get objectType(): string {
    return 'EmployeeSalaryItem'
  }

  protected get modelClass(): ModelConstructor<EmployeeSalaryItem> {
    return EmployeeSalaryItem
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      employeeSalaryId: required('Employee salary'),
      componentId: required('Component'),
      amount: required('Amount'),
    })
  }

  findByEmployeeSalary(employeeSalaryId: string, options: FindOptions = {}): EmployeeSalaryItem[] {
    return this.query('employeeSalaryId == $0', [employeeSalaryId], options)
  }

  findByComponent(componentId: string, options: FindOptions = {}): EmployeeSalaryItem[] {
    return this.query('componentId == $0', [componentId], options)
  }

  deleteByEmployeeSalary(employeeSalaryId: string): void {
    const items = this.findByEmployeeSalary(employeeSalaryId, { includeDeleted: true })
    for (const item of items) {
      this.softDelete(item._id)
    }
  }
}
