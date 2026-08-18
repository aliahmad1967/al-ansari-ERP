import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import { FiscalYearStatus } from '@/core/models/FiscalYear'
import { FiscalPeriodStatus } from '@/core/models/FiscalPeriod'
import { FiscalYearRepository } from '@/core/repositories/FiscalYearRepository'
import { FiscalPeriodRepository } from '@/core/repositories/FiscalPeriodRepository'
import { JournalEntryRepository } from '@/core/repositories/JournalEntryRepository'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'

export class FiscalYearService {
  private readonly yearRepo = new FiscalYearRepository()
  private readonly periodRepo = new FiscalPeriodRepository()
  private readonly entryRepo = new JournalEntryRepository()
  private readonly auditRepo = new AuditRepository()

  findAllYears(options: FindOptions = {}) {
    return this.yearRepo.findAll(options)
  }

  findYearById(id: string) {
    return this.yearRepo.findById(id)
  }

  findOpenYears(options: FindOptions = {}) {
    return this.yearRepo.findOpen(options)
  }

  findActiveYear(): ReturnType<FiscalYearRepository['findOpen']>[number] | null {
    const openYears = this.yearRepo.findOpen({ sortBy: 'startDate', sortAscending: false })
    return openYears[0] ?? null
  }

  findYearByCode(code: string) {
    return this.yearRepo.findByCode(code)
  }

  findYearForDate(date: Date) {
    const years = this.yearRepo.findByDateRange(date, date)
    return years[0] ?? null
  }

  searchYears(query: string, options: FindOptions = {}) {
    return this.yearRepo.search(query, options)
  }

  getYearPeriods(fiscalYearId: string, options: FindOptions = {}) {
    return this.periodRepo.findByFiscalYear(fiscalYearId, options)
  }

  findPeriodById(id: string) {
    return this.periodRepo.findById(id)
  }

  findOpenPeriods(fiscalYearId: string) {
    return this.periodRepo.findOpenByFiscalYear(fiscalYearId)
  }

  findPeriodForDate(date: Date, fiscalYearId?: string) {
    return this.periodRepo.findByDate(date, fiscalYearId)
  }

  createYear(
    input: {
      code: string
      name: string
      nameAr?: string
      startDate: Date
      endDate: Date
      notes?: string
      createPeriods?: boolean
      periodType?: 'monthly' | 'quarterly'
    },
    actorUserId?: string,
    actorUsername?: string,
  ) {
    const existing = this.yearRepo.findByCode(input.code)
    if (existing) {
      throw new Error(`Fiscal year with code "${input.code}" already exists`)
    }

    if (input.startDate >= input.endDate) {
      throw new Error('Start date must be before end date')
    }

    const year = this.yearRepo.create({
      code: input.code,
      name: input.name,
      nameAr: input.nameAr ?? null,
      startDate: input.startDate,
      endDate: input.endDate,
      status: FiscalYearStatus.Draft,
      isClosed: false,
      notes: input.notes ?? null,
    })

    if (input.createPeriods !== false) {
      this.createPeriodsForYear(year._id, input.startDate, input.endDate, input.periodType ?? 'monthly')
    }

    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'accounting',
      resourceType: 'FiscalYear',
      resourceId: year._id,
      summary: `Fiscal year "${year.code} - ${year.name}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return year
  }

  openYear(id: string, actorUserId?: string, actorUsername?: string) {
    const year = this.yearRepo.findById(id)
    if (!year) throw new Error('Fiscal year not found')
    if (year.status !== FiscalYearStatus.Draft) {
      throw new Error('Only draft fiscal years can be opened')
    }

    const updated = this.yearRepo.update(id, { status: FiscalYearStatus.Open })

    const periods = this.periodRepo.findByFiscalYear(id)
    for (const period of periods) {
      if (period.status === FiscalPeriodStatus.Draft) {
        this.periodRepo.update(period._id, { status: FiscalPeriodStatus.Open })
      }
    }

    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'accounting',
      resourceType: 'FiscalYear',
      resourceId: id,
      summary: `Fiscal year "${year.code}" opened`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return updated
  }

  closeYear(id: string, actorUserId?: string, actorUsername?: string) {
    const year = this.yearRepo.findById(id)
    if (!year) throw new Error('Fiscal year not found')
    if (year.status !== FiscalYearStatus.Open) {
      throw new Error('Only open fiscal years can be closed')
    }

    const periods = this.periodRepo.findByFiscalYear(id)
    const openPeriods = periods.filter((p) => p.status === FiscalPeriodStatus.Open)
    if (openPeriods.length > 0) {
      throw new Error('Cannot close fiscal year with open periods')
    }

    const draftEntries = this.entryRepo.findByFiscalYear(id, { sortBy: 'status' })
    const hasUnposted = draftEntries.some(
      (e) => e.status === 'draft' || e.status === 'reviewed' || e.status === 'approved',
    )
    if (hasUnposted) {
      throw new Error('Cannot close fiscal year with unposted journal entries')
    }

    this.yearRepo.update(id, {
      status: FiscalYearStatus.Closed,
      isClosed: true,
      closedAt: new Date(),
      closedByUserId: actorUserId ?? null,
    })

    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'accounting',
      resourceType: 'FiscalYear',
      resourceId: id,
      summary: `Fiscal year "${year.code}" closed`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return this.yearRepo.findById(id)
  }

  searchPeriods(query: string, fiscalYearId?: string, options: FindOptions = {}) {
    let results = this.periodRepo.search(query, options)
    if (fiscalYearId) {
      results = results.filter((p) => p.fiscalYearId === fiscalYearId)
    }
    return results
  }

  private createPeriodsForYear(fiscalYearId: string, startDate: Date, endDate: Date, periodType: 'monthly' | 'quarterly') {
    const months = periodType === 'quarterly' ? 3 : 1
    let current = new Date(startDate)
    let sequence = 1

    while (current < endDate) {
      const periodEnd = new Date(current)
      periodEnd.setMonth(periodEnd.getMonth() + months)
      if (periodEnd > endDate) {
        periodEnd.setTime(endDate.getTime())
      }

      const code = periodType === 'quarterly'
        ? `Q${sequence}`
        : `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`

      const name = periodType === 'quarterly'
        ? `Q${sequence} ${current.getFullYear()}`
        : `${current.toLocaleString('en', { month: 'long' })} ${current.getFullYear()}`

      this.periodRepo.create({
        fiscalYearId,
        code,
        name,
        nameAr: null,
        startDate: new Date(current),
        endDate: new Date(periodEnd),
        status: FiscalPeriodStatus.Draft,
      })

      current.setMonth(current.getMonth() + months)
      sequence++
    }
  }
}
