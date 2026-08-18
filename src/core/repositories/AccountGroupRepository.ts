import { AccountGroup, type AccountGroupInput } from '../models/AccountGroup'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class AccountGroupRepository extends BaseRepository<AccountGroup, AccountGroupInput> {
  protected get objectType(): string {
    return 'AccountGroup'
  }

  protected get modelClass(): ModelConstructor<AccountGroup> {
    return AccountGroup
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      code: required('Account group code'),
      name: required('Account group name'),
      type: required('Account type'),
    })
  }

  findByCode(code: string): AccountGroup | null {
    return this.first('code == $0', [code])
  }

  findActive(options: FindOptions = {}): AccountGroup[] {
    return this.query('isActive == true', [], options)
  }

  findByType(type: string, options: FindOptions = {}): AccountGroup[] {
    return this.query('type == $0', [type], options)
  }

  search(query: string, options: FindOptions = {}): AccountGroup[] {
    const byName = this.query('name CONTAINS[c] $0 OR nameAr CONTAINS[c] $0', [query], options)
    const byCode = this.query('code CONTAINS[c] $0', [query], options)
    const ids = new Set<string>()
    const result: AccountGroup[] = []
    for (const item of [...byCode, ...byName]) {
      if (!ids.has(item._id)) {
        ids.add(item._id)
        result.push(item)
      }
    }
    return result
  }
}
