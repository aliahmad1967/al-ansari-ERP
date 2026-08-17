import { PayrollItem, type PayrollItemInput, type PayrollItemStatusValue } from '../models/PayrollItem'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class PayrollItemRepository extends BaseRepository<PayrollItem, PayrollItemInput> {
  protected get objectType(): string {
    return 'PayrollItem'
  }

  protected get modelClass(): ModelConstructor<PayrollItem> {
    return PayrollItem
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      payrollRunId: required('Payroll run'),
      employeeId: required('Employee'),
      periodId: required('Period'),
    })
  }

  findByPayrollRun(payrollRunId: string, options: FindOptions = {}): PayrollItem[] {
    return this.query('payrollRunId == $0', [payrollRunId], options)
  }

  findByEmployee(employeeId: string, options: FindOptions = {}): PayrollItem[] {
    return this.query('employeeId == $0', [employeeId], { ...options, sortBy: 'createdAt', sortAscending: false })
  }

  findByPeriod(periodId: string, options: FindOptions = {}): PayrollItem[] {
    return this.query('periodId == $0', [periodId], options)
  }

  findByStatus(status: PayrollItemStatusValue, options: FindOptions = {}): PayrollItem[] {
    return this.query('status == $0', [status], options)
  }

  findByEmployeeAndPeriod(employeeId: string, periodId: string): PayrollItem | null {
    return this.first('employeeId == $0 && periodId == $1', [employeeId, periodId])
  }

  deleteByPayrollRun(payrollRunId: string): void {
    const items = this.findByPayrollRun(payrollRunId, { includeDeleted: true })
    for (const item of items) {
      this.softDelete(item._id)
    }
  }
}
