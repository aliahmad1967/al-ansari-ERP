import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import { AssetStatus, type AssetInput, type AssetStatusValue, type DepreciationMethodValue } from '@/core/models/Asset'
import { AssetRepository } from '@/core/repositories/AssetRepository'
import { AssetCategoryRepository } from '@/core/repositories/AssetCategoryRepository'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'
import { newDocumentNumber } from '@/core/utils/generators'

export class AssetService {
  private readonly assetRepo = new AssetRepository()
  private readonly categoryRepo = new AssetCategoryRepository()
  private readonly auditRepo = new AuditRepository()

  findAllAssets(options: FindOptions = {}) { return this.assetRepo.findAll(options) }
  findAssetById(id: string) { return this.assetRepo.findById(id) }
  findAssetByCode(code: string) { return this.assetRepo.findByCode(code) }
  findAssetsByCategory(categoryId: string) { return this.assetRepo.findByCategory(categoryId) }
  findAssetsByStatus(status: AssetStatusValue) { return this.assetRepo.findByStatus(status) }
  searchAssets(query: string) { return this.assetRepo.search(query) }

  getNextAssetCode(): string {
    const allAssets = this.assetRepo.findAll({ includeDeleted: true })
    const sequence = allAssets.length + 1
    return newDocumentNumber('AST', sequence, 6)
  }

  createAsset(input: Omit<AssetInput, 'code'> & { code?: string }, actorUserId?: string, actorUsername?: string) {
    const category = this.categoryRepo.findById(input.categoryId)
    if (!category) throw new Error('Asset category not found')

    const depreciationMethod = (input.depreciationMethod ?? category.defaultDepreciationMethod) as DepreciationMethodValue
    const usefulLifeMonths = input.usefulLifeMonths ?? category.defaultUsefulLifeMonths

    const code = input.code ?? this.getNextAssetCode()

    const asset = this.assetRepo.create({
      ...input,
      code,
      depreciationMethod,
      usefulLifeMonths,
      status: AssetStatus.Active,
    })

    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'assets',
      resourceType: 'Asset',
      resourceId: asset._id,
      summary: `Asset "${code}" registered`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return asset
  }

  updateAsset(id: string, changes: Partial<AssetInput>, actorUserId?: string, actorUsername?: string) {
    const asset = this.assetRepo.findById(id)
    if (!asset) throw new Error('Asset not found')

    const updated = this.assetRepo.update(id, changes)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'assets',
      resourceType: 'Asset',
      resourceId: id,
      summary: `Asset "${asset.code}" updated`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return updated
  }

  updateAssetStatus(id: string, status: AssetStatusValue, actorUserId?: string, actorUsername?: string) {
    const asset = this.assetRepo.findById(id)
    if (!asset) throw new Error('Asset not found')

    const validTransitions: Record<string, string[]> = {
      [AssetStatus.Active]: [AssetStatus.Inactive, AssetStatus.UnderMaintenance, AssetStatus.Transferred, AssetStatus.Disposed],
      [AssetStatus.Inactive]: [AssetStatus.Active],
      [AssetStatus.UnderMaintenance]: [AssetStatus.Active],
      [AssetStatus.Transferred]: [AssetStatus.Active],
      [AssetStatus.Disposed]: [],
    }
    const allowed = validTransitions[asset.status] ?? []
    if (!allowed.includes(status)) {
      throw new Error(`Cannot transition from "${asset.status}" to "${status}"`)
    }

    const updated = this.assetRepo.update(id, { status })
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'assets',
      resourceType: 'Asset',
      resourceId: id,
      summary: `Asset "${asset.code}" status changed to "${status}"`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return updated
  }

  archiveAsset(id: string, actorUserId?: string, actorUsername?: string) {
    const asset = this.assetRepo.findById(id)
    if (!asset) throw new Error('Asset not found')
    this.assetRepo.softDelete(id)
    this.auditRepo.create({
      action: AuditAction.Delete,
      module: 'assets',
      resourceType: 'Asset',
      resourceId: id,
      summary: `Asset "${asset.code}" archived`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return true
  }

  restoreAsset(id: string, actorUserId?: string, actorUsername?: string) {
    const asset = this.assetRepo.findByIdIncludingDeleted(id)
    if (!asset) throw new Error('Asset not found')
    this.assetRepo.restore(id)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'assets',
      resourceType: 'Asset',
      resourceId: id,
      summary: `Asset "${asset.code}" restored`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return true
  }
}
