import { CostCenter, type CostCenterInput } from '../models/CostCenter'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class CostCenterRepository extends BaseRepository<CostCenter, CostCenterInput> {
  protected get objectType(): string {
    return 'CostCenter'
  }

  protected get modelClass(): ModelConstructor<CostCenter> {
    return CostCenter
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      code: required('Cost center code'),
      name: required('Cost center name'),
    })
  }

  findByCode(code: string): CostCenter | null {
    return this.first('code == $0', [code])
  }

  findActive(options: FindOptions = {}): CostCenter[] {
    return this.query('isActive == true', [], options)
  }

  findByParent(parentCostCenterId: string, options: FindOptions = {}): CostCenter[] {
    return this.query('parentCostCenterId == $0', [parentCostCenterId], options)
  }

  search(query: string, options: FindOptions = {}): CostCenter[] {
    const byName = this.query('name CONTAINS[c] $0 OR nameAr CONTAINS[c] $0', [query], options)
    const byCode = this.query('code CONTAINS[c] $0', [query], options)
    const ids = new Set<string>()
    const result: CostCenter[] = []
    for (const item of [...byCode, ...byName]) {
      if (!ids.has(item._id)) {
        ids.add(item._id)
        result.push(item)
      }
    }
    return result
  }
}
