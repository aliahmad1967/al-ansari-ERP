import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import { JournalEntryStatus, JournalEntryReferenceType, type JournalEntryStatusValue } from '@/core/models/JournalEntry'
import { JournalEntryRepository } from '@/core/repositories/JournalEntryRepository'
import { JournalEntryLineRepository } from '@/core/repositories/JournalEntryLineRepository'
import { LedgerTransactionRepository } from '@/core/repositories/LedgerTransactionRepository'
import { AccountRepository } from '@/core/repositories/AccountRepository'
import { FiscalPeriodRepository } from '@/core/repositories/FiscalPeriodRepository'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'
import { newDocumentNumber } from '@/core/utils/generators'
import { money, toNumber } from '@/core/utils/currency'

export interface JournalEntryLineInput {
  accountId: string
  debit: number
  credit: number
  description?: string
  costCenterId?: string
  customerId?: string
  supplierId?: string
}

export class JournalEntryService {
  private readonly entryRepo = new JournalEntryRepository()
  private readonly lineRepo = new JournalEntryLineRepository()
  private readonly ledgerRepo = new LedgerTransactionRepository()
  private readonly accountRepo = new AccountRepository()
  private readonly periodRepo = new FiscalPeriodRepository()
  private readonly auditRepo = new AuditRepository()

  findAllEntries(options: FindOptions = {}) {
    return this.entryRepo.findAll(options)
  }

  findEntryById(id: string) {
    return this.entryRepo.findById(id)
  }

  findEntryByCode(code: string) {
    return this.entryRepo.findByCode(code)
  }

  findEntriesByStatus(status: JournalEntryStatusValue, options: FindOptions = {}) {
    return this.entryRepo.findByStatus(status, options)
  }

  findEntriesByFiscalYear(fiscalYearId: string, options: FindOptions = {}) {
    return this.entryRepo.findByFiscalYear(fiscalYearId, options)
  }

  findEntriesByFiscalPeriod(fiscalPeriodId: string, options: FindOptions = {}) {
    return this.entryRepo.findByFiscalPeriod(fiscalPeriodId, options)
  }

  findEntriesByDateRange(startDate: Date, endDate: Date, options: FindOptions = {}) {
    return this.entryRepo.findByDateRange(startDate, endDate, options)
  }

  searchEntries(query: string, options: FindOptions = {}) {
    return this.entryRepo.search(query, options)
  }

  getEntryLines(entryId: string) {
    return this.lineRepo.findByJournalEntry(entryId)
  }

  getNextEntryCode(): string {
    const currentYear = new Date().getFullYear()
    const entries = this.entryRepo.findByFiscalYear(String(currentYear))
    const sequence = entries.length + 1
    return newDocumentNumber('JE', sequence, 6)
  }

  createDraftEntry(
    input: {
      entryDate: Date
      fiscalYearId: string
      fiscalPeriodId: string
      description: string
      notes?: string
      referenceType?: string
      referenceId?: string
      referenceNumber?: string
      reversalOfId?: string
      lines: JournalEntryLineInput[]
    },
    actorUserId?: string,
    actorUsername?: string,
  ) {
    if (input.lines.length < 2) {
      throw new Error('Journal entry must have at least 2 lines')
    }

    for (const line of input.lines) {
      const account = this.accountRepo.findById(line.accountId)
      if (!account) {
        throw new Error(`Account not found: ${line.accountId}`)
      }
      if (!account.isActive) {
        throw new Error(`Account "${account.code}" is not active`)
      }
      if (line.debit < 0 || line.credit < 0) {
        throw new Error('Debit and credit amounts must be non-negative')
      }
      if (line.debit > 0 && line.credit > 0) {
        throw new Error('A line cannot have both debit and credit amounts')
      }
      if (line.debit === 0 && line.credit === 0) {
        throw new Error('A line must have either a debit or credit amount')
      }
    }

    const period = this.periodRepo.findById(input.fiscalPeriodId)
    if (!period) {
      throw new Error('Fiscal period not found')
    }
    if (period.status !== 'open') {
      throw new Error('Fiscal period is not open')
    }

    const totalDebit = toNumber(
      input.lines.reduce((sum, l) => sum.plus(money(l.debit)), money(0)),
    )
    const totalCredit = toNumber(
      input.lines.reduce((sum, l) => sum.plus(money(l.credit)), money(0)),
    )

    if (totalDebit !== totalCredit) {
      throw new Error(
        `Debit/Credit mismatch: Debit ${totalDebit} != Credit ${totalCredit}`,
      )
    }

    const code = this.getNextEntryCode()

    const entry = this.entryRepo.create({
      code,
      entryDate: input.entryDate,
      fiscalYearId: input.fiscalYearId,
      fiscalPeriodId: input.fiscalPeriodId,
      referenceType: (input.referenceType as typeof JournalEntryReferenceType[keyof typeof JournalEntryReferenceType]) ?? JournalEntryReferenceType.Manual,
      referenceId: input.referenceId ?? null,
      referenceNumber: input.referenceNumber ?? null,
      description: input.description,
      notes: input.notes ?? null,
      status: JournalEntryStatus.Draft,
      reversalOfId: input.reversalOfId ?? null,
      totalDebit,
      totalCredit,
      currency: 'SAR',
      createdByUserId: actorUserId ?? null,
    })

    for (const line of input.lines) {
      this.lineRepo.create({
        journalEntryId: entry._id,
        accountId: line.accountId,
        debit: line.debit,
        credit: line.credit,
        currency: 'SAR',
        exchangeRate: 1,
        description: line.description ?? null,
        costCenterId: line.costCenterId ?? null,
        customerId: line.customerId ?? null,
        supplierId: line.supplierId ?? null,
      })
    }

    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'accounting',
      resourceType: 'JournalEntry',
      resourceId: entry._id,
      summary: `Journal entry "${code}" created as draft`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return entry
  }

  reviewEntry(id: string, actorUserId?: string, actorUsername?: string) {
    const entry = this.entryRepo.findById(id)
    if (!entry) throw new Error('Journal entry not found')
    if (entry.status !== JournalEntryStatus.Draft) {
      throw new Error('Only draft entries can be reviewed')
    }

    const lines = this.lineRepo.findByJournalEntry(id)
    if (lines.length < 2) {
      throw new Error('Journal entry must have at least 2 lines')
    }

    const totalDebit = toNumber(
      lines.reduce((sum, l) => sum.plus(money(l.debit)), money(0)),
    )
    const totalCredit = toNumber(
      lines.reduce((sum, l) => sum.plus(money(l.credit)), money(0)),
    )

    if (totalDebit !== totalCredit) {
      throw new Error(
        `Debit/Credit mismatch: Debit ${totalDebit} != Credit ${totalCredit}`,
      )
    }

    const updated = this.entryRepo.update(id, {
      status: JournalEntryStatus.Reviewed,
      reviewedAt: new Date(),
      reviewedByUserId: actorUserId ?? null,
    })

    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'accounting',
      resourceType: 'JournalEntry',
      resourceId: id,
      summary: `Journal entry "${entry.code}" reviewed`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return updated
  }

  approveEntry(id: string, actorUserId?: string, actorUsername?: string) {
    const entry = this.entryRepo.findById(id)
    if (!entry) throw new Error('Journal entry not found')
    if (entry.status !== JournalEntryStatus.Reviewed) {
      throw new Error('Only reviewed entries can be approved')
    }

    const updated = this.entryRepo.update(id, {
      status: JournalEntryStatus.Approved,
      approvedAt: new Date(),
      approvedByUserId: actorUserId ?? null,
    })

    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'accounting',
      resourceType: 'JournalEntry',
      resourceId: id,
      summary: `Journal entry "${entry.code}" approved`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return updated
  }

  postEntry(id: string, actorUserId?: string, actorUsername?: string) {
    const entry = this.entryRepo.findById(id)
    if (!entry) throw new Error('Journal entry not found')
    if (entry.status !== JournalEntryStatus.Approved) {
      throw new Error('Only approved entries can be posted')
    }

    const lines = this.lineRepo.findByJournalEntry(id)

    this.entryRepo.update(id, {
      status: JournalEntryStatus.Posted,
      postedAt: new Date(),
      postedByUserId: actorUserId ?? null,
    })

    for (const line of lines) {
      const account = this.accountRepo.findById(line.accountId)
      const lastTransaction = this.ledgerRepo.findLastByAccount(line.accountId)
      const runningBalance = lastTransaction?.balance ?? 0

      const isDebitNormal = account && ['asset', 'expense'].includes(account.type)
      const balanceChange = isDebitNormal
        ? toNumber(money(line.debit).minus(money(line.credit)))
        : toNumber(money(line.credit).minus(money(line.debit)))

      const newBalance = toNumber(money(runningBalance).plus(money(balanceChange)))

      this.ledgerRepo.create({
        accountId: line.accountId,
        journalEntryId: entry._id,
        journalEntryLineId: line._id,
        entryDate: entry.entryDate,
        debit: line.debit,
        credit: line.credit,
        balance: newBalance,
        fiscalYearId: entry.fiscalYearId,
        fiscalPeriodId: entry.fiscalPeriodId,
        referenceType: entry.referenceType,
        referenceId: entry.referenceId ?? null,
        referenceNumber: entry.referenceNumber ?? null,
        description: line.description ?? entry.description,
        costCenterId: line.costCenterId ?? null,
        customerId: line.customerId ?? null,
        supplierId: line.supplierId ?? null,
        currency: line.currency,
      })

      this.accountRepo.updateBalance(line.accountId, balanceChange)
    }

    this.auditRepo.create({
      action: AuditAction.Post,
      module: 'accounting',
      resourceType: 'JournalEntry',
      resourceId: id,
      summary: `Journal entry "${entry.code}" posted`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return this.entryRepo.findById(id)
  }

  reverseEntry(id: string, reversalDate: Date, description: string, actorUserId?: string, actorUsername?: string) {
    const originalEntry = this.entryRepo.findById(id)
    if (!originalEntry) throw new Error('Journal entry not found')
    if (originalEntry.status !== JournalEntryStatus.Posted) {
      throw new Error('Only posted entries can be reversed')
    }

    const existingReversals = this.entryRepo.findReversals(id)
    if (existingReversals.length > 0) {
      throw new Error('This entry has already been reversed')
    }

    const originalLines = this.lineRepo.findByJournalEntry(id)

    const reversalLines: JournalEntryLineInput[] = originalLines.map((line) => ({
      accountId: line.accountId,
      debit: line.credit,
      credit: line.debit,
      description: `Reversal of ${originalEntry.code}`,
      costCenterId: line.costCenterId ?? undefined,
      customerId: line.customerId ?? undefined,
      supplierId: line.supplierId ?? undefined,
    }))

    const reversalEntry = this.createDraftEntry(
      {
        entryDate: reversalDate,
        fiscalYearId: originalEntry.fiscalYearId,
        fiscalPeriodId: originalEntry.fiscalPeriodId,
        description,
        referenceType: JournalEntryReferenceType.Reversal,
        referenceId: originalEntry._id,
        referenceNumber: originalEntry.code,
        reversalOfId: originalEntry._id,
        lines: reversalLines,
      },
      actorUserId,
      actorUsername,
    )

    this.entryRepo.update(id, { status: JournalEntryStatus.Reversed })

    const reviewed = this.reviewEntry(reversalEntry._id, actorUserId, actorUsername)
    const approved = this.approveEntry(reviewed._id, actorUserId, actorUsername)
    const posted = this.postEntry(approved._id, actorUserId, actorUsername)

    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'accounting',
      resourceType: 'JournalEntry',
      resourceId: id,
      summary: `Journal entry "${originalEntry.code}" reversed via "${posted?.code}"`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return posted
  }

  deleteDraftEntry(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const entry = this.entryRepo.findById(id)
    if (!entry) return false
    if (entry.status !== JournalEntryStatus.Draft) {
      throw new Error('Only draft entries can be deleted')
    }

    this.lineRepo.deleteByJournalEntry(id)
    const result = this.entryRepo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'accounting',
        resourceType: 'JournalEntry',
        resourceId: id,
        summary: `Draft journal entry "${entry.code}" deleted`,
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }
}
