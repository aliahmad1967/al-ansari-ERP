import { PayrollLineItem, type PayrollLineItemInput } from '../models/PayrollLineItem'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class PayrollLineItemRepository extends BaseRepository<PayrollLineItem, PayrollLineItemInput> {
  protected get objectType(): string {
    return 'PayrollLineItem'
  }

  protected get modelClass(): ModelConstructor<PayrollLineItem> {
    return PayrollLineItem
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      payrollItemId: required('Payroll item'),
      componentId: required('Component'),
      amount: required('Amount'),
    })
  }

  findByPayrollItem(payrollItemId: string, options: FindOptions = {}): PayrollLineItem[] {
    return this.query('payrollItemId == $0', [payrollItemId], { ...options, sortBy: 'createdAt', sortAscending: true })
  }

  findByComponent(componentId: string, options: FindOptions = {}): PayrollLineItem[] {
    return this.query('componentId == $0', [componentId], options)
  }

  deleteByPayrollItem(payrollItemId: string): void {
    const items = this.findByPayrollItem(payrollItemId, { includeDeleted: true })
    for (const item of items) {
      this.getRealm().delete(item)
    }
  }
}
