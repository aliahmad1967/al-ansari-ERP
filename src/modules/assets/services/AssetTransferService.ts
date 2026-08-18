import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import { AssetTransferStatus, type AssetTransferInput } from '@/core/models/AssetTransfer'
import { AssetStatus } from '@/core/models/Asset'
import { AssetTransferRepository } from '@/core/repositories/AssetTransferRepository'
import { AssetRepository } from '@/core/repositories/AssetRepository'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'

export class AssetTransferService {
  private readonly transferRepo = new AssetTransferRepository()
  private readonly assetRepo = new AssetRepository()
  private readonly auditRepo = new AuditRepository()

  findAllTransfers(options: FindOptions = {}) { return this.transferRepo.findAll(options) }
  findTransferById(id: string) { return this.transferRepo.findById(id) }
  findTransfersByAsset(assetId: string) { return this.transferRepo.findByAsset(assetId) }
  findTransfersByStatus(status: AssetTransferStatus) { return this.transferRepo.findByStatus(status) }
  searchTransfers(query: string) { return this.transferRepo.search(query) }

  createTransfer(input: Omit<AssetTransferInput, 'status'>, actorUserId?: string, actorUsername?: string) {
    const asset = this.assetRepo.findById(input.assetId)
    if (!asset) throw new Error('Asset not found')
    if (asset.status === AssetStatus.Disposed) throw new Error('Cannot transfer a disposed asset')

    const transfer = this.transferRepo.create({
      ...input,
      status: AssetTransferStatus.Pending,
    })

    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'assets',
      resourceType: 'AssetTransfer',
      resourceId: transfer._id,
      summary: `Transfer requested for asset "${asset.code}"`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return transfer
  }

  approveTransfer(id: string, approverUserId: string, approverUsername: string) {
    const transfer = this.transferRepo.findById(id)
    if (!transfer) throw new Error('Transfer not found')
    if (transfer.status !== AssetTransferStatus.Pending) {
      throw new Error('Only pending transfers can be approved')
    }

    const updated = this.transferRepo.update(id, {
      status: AssetTransferStatus.Approved,
      approvedBy: approverUserId,
      approvedAt: new Date(),
    })

    this.auditRepo.create({
      action: AuditAction.Approve,
      module: 'assets',
      resourceType: 'AssetTransfer',
      resourceId: id,
      summary: `Transfer approved`,
      outcome: AuditOutcome.Success,
      actorUserId: approverUserId,
      actorUsername: approverUsername,
    })

    return updated
  }

  rejectTransfer(id: string, actorUserId?: string, actorUsername?: string) {
    const transfer = this.transferRepo.findById(id)
    if (!transfer) throw new Error('Transfer not found')
    if (transfer.status !== AssetTransferStatus.Pending) {
      throw new Error('Only pending transfers can be rejected')
    }

    const updated = this.transferRepo.update(id, { status: AssetTransferStatus.Rejected })

    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'assets',
      resourceType: 'AssetTransfer',
      resourceId: id,
      summary: `Transfer rejected`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return updated
  }

  completeTransfer(id: string, actorUserId?: string, actorUsername?: string) {
    const transfer = this.transferRepo.findById(id)
    if (!transfer) throw new Error('Transfer not found')
    if (transfer.status !== AssetTransferStatus.Approved) {
      throw new Error('Only approved transfers can be completed')
    }

    this.assetRepo.update(transfer.assetId, {
      locationId: transfer.toLocationId ?? null,
      custodianId: transfer.toCustodianId ?? null,
    })

    const updated = this.transferRepo.update(id, { status: AssetTransferStatus.Completed })

    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'assets',
      resourceType: 'AssetTransfer',
      resourceId: id,
      summary: `Transfer completed`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return updated
  }
}
