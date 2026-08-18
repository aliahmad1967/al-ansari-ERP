import { AssetCustodian, type AssetCustodianInput } from '../models/AssetCustodian'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class AssetCustodianRepository extends BaseRepository<AssetCustodian, AssetCustodianInput> {
  protected get objectType(): string {
    return 'AssetCustodian'
  }

  protected get modelClass(): ModelConstructor<AssetCustodian> {
    return AssetCustodian
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      name: required('Custodian name'),
      nameAr: required('Custodian name (Arabic)'),
    })
  }

  findByDepartmentId(departmentId: string, options: FindOptions = {}): AssetCustodian[] {
    return this.query('departmentId == $0', [departmentId], options)
  }

  search(query: string, options: FindOptions = {}): AssetCustodian[] {
    const byName = this.query('name CONTAINS[c] $0', [query], options)
    const byNameAr = this.query('nameAr CONTAINS[c] $0', [query], options)
    const ids = new Set<string>()
    const result: AssetCustodian[] = []
    for (const item of [...byName, ...byNameAr]) {
      if (!ids.has(item._id)) {
        ids.add(item._id)
        result.push(item)
      }
    }
    return result
  }
}
