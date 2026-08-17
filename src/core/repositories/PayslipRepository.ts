import { Payslip, type PayslipInput, type PayslipStatusValue } from '../models/Payslip'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class PayslipRepository extends BaseRepository<Payslip, PayslipInput> {
  protected get objectType(): string {
    return 'Payslip'
  }

  protected get modelClass(): ModelConstructor<Payslip> {
    return Payslip
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      payrollItemId: required('Payroll item'),
      employeeId: required('Employee'),
      periodId: required('Period'),
      payslipNumber: required('Payslip number'),
    })
  }

  findByEmployee(employeeId: string, options: FindOptions = {}): Payslip[] {
    return this.query('employeeId == $0', [employeeId], { ...options, sortBy: 'generatedAt', sortAscending: false })
  }

  findByPeriod(periodId: string, options: FindOptions = {}): Payslip[] {
    return this.query('periodId == $0', [periodId], options)
  }

  findByPayrollItem(payrollItemId: string): Payslip | null {
    return this.first('payrollItemId == $0', [payrollItemId])
  }

  findByPayslipNumber(payslipNumber: string): Payslip | null {
    return this.first('payslipNumber == $0', [payslipNumber])
  }

  findByStatus(status: PayslipStatusValue, options: FindOptions = {}): Payslip[] {
    return this.query('status == $0', [status], options)
  }

  getNextPayslipNumber(): string {
    const realm = this.getRealm()
    const count = realm.objects(Payslip).length
    return `PS-${String(count + 1).padStart(6, '0')}`
  }
}
