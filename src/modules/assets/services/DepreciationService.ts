import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import { DepreciationScheduleStatus, type DepreciationScheduleInput } from '@/core/models/DepreciationSchedule'
import { AssetStatus, DepreciationMethod, type DepreciationMethodValue } from '@/core/models/Asset'
import { AssetRepository } from '@/core/repositories/AssetRepository'
import { DepreciationScheduleRepository } from '@/core/repositories/DepreciationScheduleRepository'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'
import { money, toNumber, moneySub, moneyMul } from '@/core/utils/currency'

export class DepreciationService {
  private readonly assetRepo = new AssetRepository()
  private readonly scheduleRepo = new DepreciationScheduleRepository()
  private readonly auditRepo = new AuditRepository()

  findAllSchedules(options: FindOptions = {}) { return this.scheduleRepo.findAll(options) }
  findScheduleById(id: string) { return this.scheduleRepo.findById(id) }
  findSchedulesByAsset(assetId: string) { return this.scheduleRepo.findByAsset(assetId) }
  findSchedulesByStatus(status: DepreciationScheduleStatus) { return this.scheduleRepo.findByStatus(status) }

  calculatePeriodDepreciation(
    purchaseValue: number,
    salvageValue: number,
    usefulLifeMonths: number,
    depreciationMethod: DepreciationMethodValue,
    monthsElapsed: number,
  ): number {
    const cost = money(purchaseValue)
    const salvage = money(salvageValue)
    const depreciableBase = moneySub(cost, salvage)

    switch (depreciationMethod) {
      case DepreciationMethod.StraightLine: {
        const monthlyDepreciation = depreciableBase.div(usefulLifeMonths)
        return toNumber(monthlyDepreciation)
      }
      case DepreciationMethod.DecliningBalance: {
        const rate = money(2).div(usefulLifeMonths)
        const bookValue = moneySub(cost, money(monthsElapsed * toNumber(depreciableBase.div(usefulLifeMonths))))
        return toNumber(moneyMul(bookValue, rate))
      }
      case DepreciationMethod.SumOfYearsDigits: {
        const sumOfYears = (usefulLifeMonths * (usefulLifeMonths + 1)) / 2
        const remainingLife = usefulLifeMonths - monthsElapsed
        if (remainingLife <= 0) return 0
        const rate = remainingLife / sumOfYears
        return toNumber(moneyMul(depreciableBase, money(rate)))
      }
      case DepreciationMethod.UnitsOfProduction: {
        const monthlyDepreciation = depreciableBase.div(usefulLifeMonths)
        return toNumber(monthlyDepreciation)
      }
      default:
        return toNumber(depreciableBase.div(usefulLifeMonths))
    }
  }

  generateSchedule(assetId: string, actorUserId?: string, actorUsername?: string) {
    const asset = this.assetRepo.findById(assetId)
    if (!asset) throw new Error('Asset not found')
    if (asset.status !== AssetStatus.Active) throw new Error('Can only generate schedule for active assets')

    const existing = this.scheduleRepo.findByAsset(assetId)
    if (existing.length > 0) throw new Error('Depreciation schedule already exists for this asset')

    const schedules: Array<{ input: DepreciationScheduleInput; depreciationAmount: number }> = []
    let accumulatedDepreciation = 0
    const cost = money(asset.purchaseValue)
    const months = asset.usefulLifeMonths

    for (let i = 0; i < months; i++) {
      const periodStart = new Date(asset.acquisitionDate)
      periodStart.setMonth(periodStart.getMonth() + i)
      const periodEnd = new Date(asset.acquisitionDate)
      periodEnd.setMonth(periodEnd.getMonth() + i + 1)
      periodEnd.setDate(periodEnd.getDate() - 1)

      const depreciationAmount = this.calculatePeriodDepreciation(
        asset.purchaseValue,
        asset.salvageValue,
        months,
        asset.depreciationMethod as DepreciationMethodValue,
        i,
      )

      accumulatedDepreciation += depreciationAmount
      const bookValue = toNumber(moneySub(cost, money(accumulatedDepreciation)))

      schedules.push({
        input: {
          assetId,
          periodStart,
          periodEnd,
          depreciationAmount,
          accumulatedDepreciation,
          bookValue,
          status: DepreciationScheduleStatus.Draft,
        },
        depreciationAmount,
      })
    }

    const created = schedules.map(s => this.scheduleRepo.create(s.input))

    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'assets',
      resourceType: 'DepreciationSchedule',
      resourceId: assetId,
      summary: `Depreciation schedule generated for asset "${asset.code}" (${months} periods)`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return created
  }

  finalizeSchedule(scheduleId: string, actorUserId?: string, actorUsername?: string) {
    const schedule = this.scheduleRepo.findById(scheduleId)
    if (!schedule) throw new Error('Depreciation schedule not found')
    if (schedule.status !== DepreciationScheduleStatus.Draft) {
      throw new Error('Only draft schedules can be finalized')
    }

    const updated = this.scheduleRepo.update(scheduleId, {
      status: DepreciationScheduleStatus.Finalized,
      finalizedAt: new Date(),
      finalizedByUserId: actorUserId ?? null,
    })

    this.auditRepo.create({
      action: AuditAction.Post,
      module: 'assets',
      resourceType: 'DepreciationSchedule',
      resourceId: scheduleId,
      summary: `Depreciation schedule finalized for period ${schedule.periodStart.toISOString().slice(0, 10)}`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return updated
  }

  reverseSchedule(scheduleId: string, actorUserId?: string, actorUsername?: string) {
    const schedule = this.scheduleRepo.findById(scheduleId)
    if (!schedule) throw new Error('Depreciation schedule not found')
    if (schedule.status !== DepreciationScheduleStatus.Finalized) {
      throw new Error('Only finalized schedules can be reversed')
    }

    const updated = this.scheduleRepo.update(scheduleId, {
      status: DepreciationScheduleStatus.Reversed,
    })

    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'assets',
      resourceType: 'DepreciationSchedule',
      resourceId: scheduleId,
      summary: `Depreciation schedule reversed`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return updated
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  runDepreciation(asOfDate: Date, _actorUserId?: string, _actorUsername?: string) {
    const activeAssets = this.assetRepo.findByStatus(AssetStatus.Active)
    const results: Array<{ assetId: string; scheduleCount: number }> = []

    for (const asset of activeAssets) {
      const existingSchedules = this.scheduleRepo.findByAsset(asset._id)
      if (existingSchedules.length > 0) continue

      const monthsSinceAcquisition = this.getMonthsBetween(asset.acquisitionDate, asOfDate)
      if (monthsSinceAcquisition <= 0) continue

      const monthsToDepreciate = Math.min(monthsSinceAcquisition, asset.usefulLifeMonths)
      const schedule = this.generateScheduleForPeriods(asset, monthsToDepreciate, asOfDate)
      results.push({ assetId: asset._id, scheduleCount: schedule.length })
    }

    return results
  }

  private getMonthsBetween(start: Date, end: Date): number {
    return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  }

  private generateScheduleForPeriods(
    asset: { _id: string; purchaseValue: number; salvageValue: number; usefulLifeMonths: number; depreciationMethod: string; acquisitionDate: Date },
    months: number,
    asOfDate: Date,
  ) {
    const schedules: DepreciationScheduleInput[] = []
    let accumulatedDepreciation = 0
    const cost = money(asset.purchaseValue)

    for (let i = 0; i < months; i++) {
      const periodStart = new Date(asset.acquisitionDate)
      periodStart.setMonth(periodStart.getMonth() + i)
      const periodEnd = new Date(periodStart)
      periodEnd.setMonth(periodEnd.getMonth() + 1)
      periodEnd.setDate(periodEnd.getDate() - 1)

      if (periodStart > asOfDate) break

      const depreciationAmount = this.calculatePeriodDepreciation(
        asset.purchaseValue,
        asset.salvageValue,
        asset.usefulLifeMonths,
        asset.depreciationMethod as DepreciationMethodValue,
        i,
      )

      accumulatedDepreciation += depreciationAmount
      const bookValue = toNumber(moneySub(cost, money(accumulatedDepreciation)))

      schedules.push({
        assetId: asset._id,
        periodStart,
        periodEnd,
        depreciationAmount,
        accumulatedDepreciation,
        bookValue,
        status: DepreciationScheduleStatus.Draft,
      })
    }

    return schedules.map(s => this.scheduleRepo.create(s))
  }
}
