import { Customer, type CustomerInput, type CustomerStatusValue } from '../models/Customer'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class CustomerRepository extends BaseRepository<Customer, CustomerInput> {
  protected get objectType(): string {
    return 'Customer'
  }

  protected get modelClass(): ModelConstructor<Customer> {
    return Customer
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      code: required('Customer code'),
      name: required('Customer name'),
    })
  }

  findByStatus(status: CustomerStatusValue, options: FindOptions = {}): Customer[] {
    return this.query('status == $0', [status], options)
  }

  findActive(options: FindOptions = {}): Customer[] {
    return this.query('isActive == true || status == $0', ['active'], options)
  }

  findByCode(code: string): Customer | null {
    return this.first('code == $0', [code])
  }

  search(query: string, options: FindOptions = {}): Customer[] {
    const byName = this.query('name CONTAINS[c] $0 OR nameAr CONTAINS[c] $0', [query], options)
    const byCode = this.query('code CONTAINS[c] $0', [query], options)
    const byContact = this.query('contactPerson CONTAINS[c] $0', [query], options)
    const ids = new Set<string>()
    const result: Customer[] = []
    for (const item of [...byName, ...byCode, ...byContact]) {
      if (!ids.has(item._id)) {
        ids.add(item._id)
        result.push(item)
      }
    }
    return result
  }

  updateBalance(id: string, amount: number): void {
    const existing = this.findByIdIncludingDeleted(id)
    if (!existing) return
    const newBalance = existing.balance + amount
    this.update(id, { balance: newBalance } as Partial<CustomerInput>)
  }
}
