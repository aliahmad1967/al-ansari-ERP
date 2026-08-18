import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import { type CostCenterInput } from '@/core/models/CostCenter'
import { CostCenterRepository } from '@/core/repositories/CostCenterRepository'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'

export class CostCenterService {
  private readonly repo = new CostCenterRepository()
  private readonly auditRepo = new AuditRepository()

  findAll(options: FindOptions = {}) {
    return this.repo.findAll(options)
  }

  findById(id: string) {
    return this.repo.findById(id)
  }

  findByCode(code: string) {
    return this.repo.findByCode(code)
  }

  findActive(options: FindOptions = {}) {
    return this.repo.findActive(options)
  }

  findByParent(parentCostCenterId: string, options: FindOptions = {}) {
    return this.repo.findByParent(parentCostCenterId, options)
  }

  search(query: string, options: FindOptions = {}) {
    return this.repo.search(query, options)
  }

  create(
    input: CostCenterInput,
    actorUserId?: string,
    actorUsername?: string,
  ) {
    const existing = this.repo.findByCode(input.code)
    if (existing) {
      throw new Error(`Cost center with code "${input.code}" already exists`)
    }

    const costCenter = this.repo.create({
      code: input.code,
      name: input.name,
      nameAr: input.nameAr ?? null,
      description: input.description ?? null,
      descriptionAr: input.descriptionAr ?? null,
      parentCostCenterId: input.parentCostCenterId ?? null,
      isActive: true,
    })

    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'accounting',
      resourceType: 'CostCenter',
      resourceId: costCenter._id,
      summary: `Cost center "${costCenter.code} - ${costCenter.name}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })

    return costCenter
  }

  update(
    id: string,
    changes: Partial<{ name: string; nameAr: string; isActive: boolean; description: string; descriptionAr: string; parentCostCenterId: string }>,
    actorUserId?: string,
    actorUsername?: string,
  ) {
    const costCenter = this.repo.update(id, changes)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'accounting',
      resourceType: 'CostCenter',
      resourceId: costCenter._id,
      summary: `Cost center "${costCenter.code} - ${costCenter.name}" updated`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return costCenter
  }

  archive(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const costCenter = this.repo.findById(id)
    if (!costCenter) return false

    const hasChildren = this.repo.findByParent(id).length > 0
    if (hasChildren) {
      throw new Error('Cannot archive cost center with child cost centers')
    }

    const result = this.repo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'accounting',
        resourceType: 'CostCenter',
        resourceId: id,
        summary: `Cost center "${costCenter.code} - ${costCenter.name}" archived`,
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }

  restore(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const result = this.repo.restore(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Update,
        module: 'accounting',
        resourceType: 'CostCenter',
        resourceId: id,
        summary: 'Cost center restored',
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }
}
