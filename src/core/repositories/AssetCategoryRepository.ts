import { AssetCategory, type AssetCategoryInput } from '../models/AssetCategory'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class AssetCategoryRepository extends BaseRepository<AssetCategory, AssetCategoryInput> {
  protected get objectType(): string {
    return 'AssetCategory'
  }

  protected get modelClass(): ModelConstructor<AssetCategory> {
    return AssetCategory
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      code: required('Category code'),
      name: required('Category name'),
      nameAr: required('Category name (Arabic)'),
    })
  }

  findByCode(code: string): AssetCategory | null {
    return this.first('code == $0', [code])
  }

  search(query: string, options: FindOptions = {}): AssetCategory[] {
    const byName = this.query('name CONTAINS[c] $0', [query], options)
    const byNameAr = this.query('nameAr CONTAINS[c] $0', [query], options)
    const byCode = this.query('code CONTAINS[c] $0', [query], options)
    const ids = new Set<string>()
    const result: AssetCategory[] = []
    for (const item of [...byCode, ...byName, ...byNameAr]) {
      if (!ids.has(item._id)) {
        ids.add(item._id)
        result.push(item)
      }
    }
    return result
  }
}
