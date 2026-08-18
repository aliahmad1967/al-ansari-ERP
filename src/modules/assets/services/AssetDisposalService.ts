import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import { AssetDisposalStatus, type AssetDisposalInput } from '@/core/models/AssetDisposal'
import { AssetStatus } from '@/core/models/Asset'
import { AssetDisposalRepository } from '@/core/repositories/AssetDisposalRepository'
import { AssetRepository } from '@/core/repositories/AssetRepository'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import { DepreciationScheduleRepository } from '@/core/repositories/DepreciationScheduleRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'
import { money, toNumber, moneySub } from '@/core/utils/currency'

export class AssetDisposalService {
  private readonly disposalRepo = new AssetDisposalRepository()
  private readonly assetRepo = new AssetRepository()
  private readonly scheduleRepo = new DepreciationScheduleRepository()
  private readonly auditRepo = new AuditRepository()

  findAllDisposals(options: FindOptions = {}) { return this.disposalRepo.findAll(options) }
  findDisposalById(id: string) { return this.disposalRepo.findById(id) }
  findDisposalsByAsset(assetId: string) { return this.disposalRepo.findByAsset(assetId) }
  findDisposalsByStatus(status: AssetDisposalStatus) { return this.disposalRepo.findByStatus(status) }
  searchDisposals(query: string) { return this.disposalRepo.search(query) }

  getBookValue(assetId: string): number {
    const asset = this.assetRepo.findById(assetId)
    if (!asset) throw new Error('Asset not found')

    const finalizedSchedules = this.scheduleRepo.findByAsset(assetId)
      .filter(s => s.status === 'finalized')

    const totalDepreciation = finalizedSchedules.reduce(
      (sum, s) => sum + s.depreciationAmount, 0,
    )

    return toNumber(moneySub(money(asset.purchaseValue), money(totalDepreciation)))
  }

  createDisposal(input: Omit<AssetDisposalInput, 'status' | 'gainLoss'>, actorUserId?: string, actorUsername?: string) {
    const asset = this.assetRepo.findById(input.assetId)
    if (!asset) throw new Error('Asset not found')
    if (asset.status === AssetStatus.Disposed) throw new Error('Asset is already disposed')

    const bookValue = this.getBookValue(input.assetId)
    const gainLoss = toNumber(moneySub(money(input.disposalValue ?? 0), money(bookValue)))

    const disposal = this.disposalRepo.create({
      ...input,
      status: AssetDisposalStatus.Pending,
      gainLoss,
    })

    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'assets',
      resourceType: 'AssetDisposal',
      resourceId: disposal._id,
      summary: `Disposal requested for asset "${asset.code}" (${input.disposalMethod})`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return disposal
  }

  approveDisposal(id: string, approverUserId: string, approverUsername: string) {
    const disposal = this.disposalRepo.findById(id)
    if (!disposal) throw new Error('Disposal not found')
    if (disposal.status !== AssetDisposalStatus.Pending) {
      throw new Error('Only pending disposals can be approved')
    }

    const updated = this.disposalRepo.update(id, {
      status: AssetDisposalStatus.Approved,
      approvedBy: approverUserId,
      approvedAt: new Date(),
    })

    this.auditRepo.create({
      action: AuditAction.Approve,
      module: 'assets',
      resourceType: 'AssetDisposal',
      resourceId: id,
      summary: `Disposal approved`,
      outcome: AuditOutcome.Success,
      actorUserId: approverUserId,
      actorUsername: approverUsername,
    })

    return updated
  }

  completeDisposal(id: string, actorUserId?: string, actorUsername?: string) {
    const disposal = this.disposalRepo.findById(id)
    if (!disposal) throw new Error('Disposal not found')
    if (disposal.status !== AssetDisposalStatus.Approved) {
      throw new Error('Only approved disposals can be completed')
    }

    this.assetRepo.update(disposal.assetId, {
      status: AssetStatus.Disposed,
      disposalDate: disposal.disposalDate,
    })

    const updated = this.disposalRepo.update(id, { status: AssetDisposalStatus.Completed })

    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'assets',
      resourceType: 'AssetDisposal',
      resourceId: id,
      summary: `Disposal completed`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return updated
  }

  rejectDisposal(id: string, actorUserId?: string, actorUsername?: string) {
    const disposal = this.disposalRepo.findById(id)
    if (!disposal) throw new Error('Disposal not found')
    if (disposal.status !== AssetDisposalStatus.Pending) {
      throw new Error('Only pending disposals can be rejected')
    }

    const updated = this.disposalRepo.update(id, { status: AssetDisposalStatus.Rejected })

    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'assets',
      resourceType: 'AssetDisposal',
      resourceId: id,
      summary: `Disposal rejected`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return updated
  }
}
