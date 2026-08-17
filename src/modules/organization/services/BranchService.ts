/**
 * BranchService — business-layer facade for branch management.
 */

import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import type { Branch, BranchInput, BranchStatusValue } from '@/core/models/Branch'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import { BranchRepository } from '@/core/repositories/BranchRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'

export class BranchService {
  private readonly repo = new BranchRepository()
  private readonly auditRepo = new AuditRepository()

  findAll(options: FindOptions = {}): Branch[] {
    return this.repo.findAll(options)
  }

  findById(id: string): Branch | null {
    return this.repo.findById(id)
  }

  findByOrganization(organizationId: string): Branch[] {
    return this.repo.findByOrganization(organizationId)
  }

  count(): number {
    return this.repo.count()
  }

  create(input: BranchInput, actorUserId?: string, actorUsername?: string): Branch {
    const branch = this.repo.create(input)
    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'organization',
      resourceType: 'Branch',
      resourceId: branch._id,
      summary: `Branch "${branch.name}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return branch
  }

  update(id: string, changes: Partial<BranchInput>, actorUserId?: string, actorUsername?: string): Branch {
    const branch = this.repo.update(id, changes)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'organization',
      resourceType: 'Branch',
      resourceId: branch._id,
      summary: `Branch "${branch.name}" updated`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return branch
  }

  archive(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const branch = this.repo.findById(id)
    const result = this.repo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'organization',
        resourceType: 'Branch',
        resourceId: id,
        summary: `Branch "${branch?.name ?? id}" archived`,
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
        module: 'organization',
        resourceType: 'Branch',
        resourceId: id,
        summary: 'Branch restored',
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }

  updateStatus(id: string, status: BranchStatusValue, actorUserId?: string, actorUsername?: string): Branch {
    const branch = this.repo.update(id, { status })
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'organization',
      resourceType: 'Branch',
      resourceId: branch._id,
      summary: `Branch "${branch.name}" status changed to ${status}`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return branch
  }
}
