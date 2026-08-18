import { AccountingPolicy, type AccountingPolicyInput } from '../models/AccountingPolicy'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type ModelConstructor } from './BaseRepository'

export class AccountingPolicyRepository extends BaseRepository<AccountingPolicy, AccountingPolicyInput> {
  protected get objectType(): string {
    return 'AccountingPolicy'
  }

  protected get modelClass(): ModelConstructor<AccountingPolicy> {
    return AccountingPolicy
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      key: required('Policy key'),
      value: required('Policy value'),
    })
  }

  findByKey(key: string): AccountingPolicy | null {
    return this.first('key == $0', [key])
  }

  getValue(key: string): string | null {
    const policy = this.findByKey(key)
    return policy?.value ?? null
  }

  setValue(key: string, value: string, description?: string, descriptionAr?: string): AccountingPolicy {
    const existing = this.findByKey(key)
    if (existing) {
      return this.update(existing._id, { value, description, descriptionAr } as Partial<AccountingPolicyInput>)
    }
    return this.create({ key, value, description, descriptionAr })
  }
}
