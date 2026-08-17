import { Supplier, type SupplierInput, type SupplierStatusValue } from '../models/Supplier'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class SupplierRepository extends BaseRepository<Supplier, SupplierInput> {
  protected get objectType(): string {
    return 'Supplier'
  }

  protected get modelClass(): ModelConstructor<Supplier> {
    return Supplier
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      code: required('Supplier code'),
      name: required('Supplier name'),
    })
  }

  findByStatus(status: SupplierStatusValue, options: FindOptions = {}): Supplier[] {
    return this.query('status == $0', [status], options)
  }

  findActive(options: FindOptions = {}): Supplier[] {
    return this.query('isActive == true', [], options)
  }

  search(query: string, options: FindOptions = {}): Supplier[] {
    const byName = this.query('name CONTAINS[c] $0 OR nameAr CONTAINS[c] $0', [query], options)
    const byCode = this.query('code CONTAINS[c] $0', [query], options)
    const byContact = this.query('contactPerson CONTAINS[c] $0', [query], options)
    const ids = new Set([...byName, ...byCode, ...byContact].map(s => s._id))
    return [...byName, ...byCode, ...byContact].filter(s => {
      if (ids.has(s._id)) {
        ids.delete(s._id)
        return true
      }
      return false
    })
  }
}
