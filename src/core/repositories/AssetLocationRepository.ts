import { AssetLocation, type AssetLocationInput } from '../models/AssetLocation'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class AssetLocationRepository extends BaseRepository<AssetLocation, AssetLocationInput> {
  protected get objectType(): string {
    return 'AssetLocation'
  }

  protected get modelClass(): ModelConstructor<AssetLocation> {
    return AssetLocation
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      code: required('Location code'),
      name: required('Location name'),
      nameAr: required('Location name (Arabic)'),
    })
  }

  findByCode(code: string): AssetLocation | null {
    return this.first('code == $0', [code])
  }

  findByBranchId(branchId: string, options: FindOptions = {}): AssetLocation[] {
    return this.query('branchId == $0', [branchId], options)
  }

  search(query: string, options: FindOptions = {}): AssetLocation[] {
    const byName = this.query('name CONTAINS[c] $0', [query], options)
    const byNameAr = this.query('nameAr CONTAINS[c] $0', [query], options)
    const byCode = this.query('code CONTAINS[c] $0', [query], options)
    const ids = new Set<string>()
    const result: AssetLocation[] = []
    for (const item of [...byCode, ...byName, ...byNameAr]) {
      if (!ids.has(item._id)) {
        ids.add(item._id)
        result.push(item)
      }
    }
    return result
  }
}
