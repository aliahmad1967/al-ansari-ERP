import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import { type AccountTypeValue } from '@/core/models/Account'
import { AccountRepository } from '@/core/repositories/AccountRepository'
import { AccountGroupRepository } from '@/core/repositories/AccountGroupRepository'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'
import { money, toNumber } from '@/core/utils/currency'

export class AccountService {
  private readonly accountRepo = new AccountRepository()
  private readonly groupRepo = new AccountGroupRepository()
  private readonly auditRepo = new AuditRepository()

  findAllAccounts(options: FindOptions = {}): ReturnType<AccountRepository['findAll']> {
    return this.accountRepo.findAll(options)
  }

  findAccountById(id: string): ReturnType<AccountRepository['findById']> {
    return this.accountRepo.findById(id)
  }

  findAccountByCode(code: string): ReturnType<AccountRepository['findByCode']> {
    return this.accountRepo.findByCode(code)
  }

  findAccountsByType(type: AccountTypeValue, options: FindOptions = {}): ReturnType<AccountRepository['findByType']> {
    return this.accountRepo.findByType(type, options)
  }

  findActiveAccounts(options: FindOptions = {}): ReturnType<AccountRepository['findActive']> {
    return this.accountRepo.findActive(options)
  }

  findLeafAccounts(options: FindOptions = {}): ReturnType<AccountRepository['findLeafAccounts']> {
    return this.accountRepo.findLeafAccounts(options)
  }

  findGroupAccounts(accountGroupId: string, options: FindOptions = {}): ReturnType<AccountRepository['findByAccountGroup']> {
    return this.accountRepo.findByAccountGroup(accountGroupId, options)
  }

  searchAccounts(query: string, options: FindOptions = {}): ReturnType<AccountRepository['search']> {
    return this.accountRepo.search(query, options)
  }

  createAccount(
    input: { code: string; name: string; nameAr?: string; type: AccountTypeValue; parentAccountId?: string; accountGroupId?: string; currency?: string; description?: string; descriptionAr?: string; openingBalance?: number; costCenterId?: string; notes?: string },
    actorUserId?: string,
    actorUsername?: string,
  ) {
    const existing = this.accountRepo.findByCode(input.code)
    if (existing) {
      throw new Error(`Account with code "${input.code}" already exists`)
    }

    const level = input.parentAccountId ? this.calculateLevel(input.parentAccountId) + 1 : 0

    const account = this.accountRepo.create({
      code: input.code,
      name: input.name,
      nameAr: input.nameAr,
      type: input.type,
      parentAccountId: input.parentAccountId,
      accountGroupId: input.accountGroupId,
      level,
      isGroup: false,
      isActive: true,
      currency: input.currency ?? 'SAR',
      description: input.description,
      descriptionAr: input.descriptionAr,
      openingBalance: input.openingBalance ?? 0,
      currentBalance: input.openingBalance ?? 0,
      costCenterId: input.costCenterId,
      notes: input.notes,
    })

    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'accounting',
      resourceType: 'Account',
      resourceId: account._id,
      summary: `Account "${account.code} - ${account.name}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return account
  }

  updateAccount(
    id: string,
    changes: Partial<{ name: string; nameAr: string; isActive: boolean; description: string; descriptionAr: string; costCenterId: string; notes: string; accountGroupId: string }>,
    actorUserId?: string,
    actorUsername?: string,
  ) {
    const account = this.accountRepo.update(id, changes)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'accounting',
      resourceType: 'Account',
      resourceId: account._id,
      summary: `Account "${account.code} - ${account.name}" updated`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return account
  }

  archiveAccount(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const account = this.accountRepo.findById(id)
    if (!account) return false

    const hasChildren = this.accountRepo.findByParent(id).length > 0
    if (hasChildren) {
      throw new Error('Cannot archive account with child accounts')
    }

    if (account.currentBalance !== 0) {
      throw new Error('Cannot archive account with non-zero balance')
    }

    const result = this.accountRepo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'accounting',
        resourceType: 'Account',
        resourceId: id,
        summary: `Account "${account.code} - ${account.name}" archived`,
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }

  restoreAccount(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const result = this.accountRepo.restore(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Update,
        module: 'accounting',
        resourceType: 'Account',
        resourceId: id,
        summary: 'Account restored',
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }

  getAccountBalance(id: string): number {
    const account = this.accountRepo.findById(id)
    if (!account) return 0
    return account.currentBalance
  }

  updateAccountBalance(id: string, debitAmount: number, creditAmount: number): void {
    const account = this.accountRepo.findById(id)
    if (!account) return

    const normalDebitTypes = ['asset', 'expense']
    const isDebitNormal = normalDebitTypes.includes(account.type)

    const change = isDebitNormal
      ? toNumber(money(debitAmount).minus(money(creditAmount)))
      : toNumber(money(creditAmount).minus(money(debitAmount)))

    this.accountRepo.updateBalance(id, change)
  }

  private calculateLevel(parentAccountId: string): number {
    const parent = this.accountRepo.findById(parentAccountId)
    if (!parent) return 0
    return parent.level
  }

  findAllGroups(options: FindOptions = {}) {
    return this.groupRepo.findAll(options)
  }

  createGroup(
    input: { code: string; name: string; nameAr?: string; type: AccountTypeValue; description?: string; descriptionAr?: string },
    actorUserId?: string,
    actorUsername?: string,
  ) {
    const existing = this.groupRepo.findByCode(input.code)
    if (existing) {
      throw new Error(`Account group with code "${input.code}" already exists`)
    }

    const allGroups = this.groupRepo.findAll()
    const sortOrder = allGroups.length + 1

    const group = this.groupRepo.create({
      code: input.code,
      name: input.name,
      nameAr: input.nameAr,
      type: input.type,
      sortOrder,
      isActive: true,
      description: input.description,
      descriptionAr: input.descriptionAr,
    })

    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'accounting',
      resourceType: 'AccountGroup',
      resourceId: group._id,
      summary: `Account group "${group.code} - ${group.name}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return group
  }

  updateGroup(
    id: string,
    changes: Partial<{ name: string; nameAr: string; isActive: boolean; description: string; descriptionAr: string }>,
    actorUserId?: string,
    actorUsername?: string,
  ) {
    const group = this.groupRepo.update(id, changes)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'accounting',
      resourceType: 'AccountGroup',
      resourceId: group._id,
      summary: `Account group "${group.code} - ${group.name}" updated`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return group
  }

  archiveGroup(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const group = this.groupRepo.findById(id)
    const hasAccounts = this.accountRepo.findByAccountGroup(id).length > 0
    if (hasAccounts) {
      throw new Error('Cannot archive account group with linked accounts')
    }

    const result = this.groupRepo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'accounting',
        resourceType: 'AccountGroup',
        resourceId: id,
        summary: `Account group "${group?.code ?? id}" archived`,
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }
}
