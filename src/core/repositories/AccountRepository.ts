import { Account, type AccountInput, type AccountTypeValue } from '../models/Account'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class AccountRepository extends BaseRepository<Account, AccountInput> {
  protected get objectType(): string {
    return 'Account'
  }

  protected get modelClass(): ModelConstructor<Account> {
    return Account
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      code: required('Account code'),
      name: required('Account name'),
      type: required('Account type'),
    })
  }

  findByCode(code: string): Account | null {
    return this.first('code == $0', [code])
  }

  findByType(type: AccountTypeValue, options: FindOptions = {}): Account[] {
    return this.query('type == $0', [type], options)
  }

  findActive(options: FindOptions = {}): Account[] {
    return this.query('isActive == true', [], options)
  }

  findByParent(parentAccountId: string, options: FindOptions = {}): Account[] {
    return this.query('parentAccountId == $0', [parentAccountId], options)
  }

  findByAccountGroup(accountGroupId: string, options: FindOptions = {}): Account[] {
    return this.query('accountGroupId == $0', [accountGroupId], options)
  }

  findByCostCenter(costCenterId: string, options: FindOptions = {}): Account[] {
    return this.query('costCenterId == $0', [costCenterId], options)
  }

  findGroupsOnly(options: FindOptions = {}): Account[] {
    return this.query('isGroup == true', [], options)
  }

  findLeafAccounts(options: FindOptions = {}): Account[] {
    return this.query('isGroup == false', [], options)
  }

  search(query: string, options: FindOptions = {}): Account[] {
    const byName = this.query('name CONTAINS[c] $0 OR nameAr CONTAINS[c] $0', [query], options)
    const byCode = this.query('code CONTAINS[c] $0', [query], options)
    const ids = new Set<string>()
    const result: Account[] = []
    for (const item of [...byCode, ...byName]) {
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
    const newBalance = existing.currentBalance + amount
    this.update(id, { currentBalance: newBalance } as Partial<AccountInput>)
  }
}
