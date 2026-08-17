/**
 * OrganizationService — business-layer facade for organization management.
 */

import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import type { Organization, OrganizationInput, OrganizationStatusValue } from '@/core/models/Organization'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import { OrganizationRepository } from '@/core/repositories/OrganizationRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'

export class OrganizationService {
  private readonly repo = new OrganizationRepository()
  private readonly auditRepo = new AuditRepository()

  findAll(options: FindOptions = {}): Organization[] {
    return this.repo.findAll(options)
  }

  findById(id: string): Organization | null {
    return this.repo.findById(id)
  }

  findByCode(code: string): Organization | null {
    return this.repo.findByCode(code)
  }

  count(): number {
    return this.repo.count()
  }

  countActive(): number {
    return this.repo.countActive()
  }

  create(input: OrganizationInput, actorUserId?: string, actorUsername?: string): Organization {
    const org = this.repo.create(input)
    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'organization',
      resourceType: 'Organization',
      resourceId: org._id,
      summary: `Organization "${org.name}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return org
  }

  update(id: string, changes: Partial<OrganizationInput>, actorUserId?: string, actorUsername?: string): Organization {
    const org = this.repo.update(id, changes)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'organization',
      resourceType: 'Organization',
      resourceId: org._id,
      summary: `Organization "${org.name}" updated`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return org
  }

  archive(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const org = this.repo.findById(id)
    const result = this.repo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'organization',
        resourceType: 'Organization',
        resourceId: id,
        summary: `Organization "${org?.name ?? id}" archived`,
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
        resourceType: 'Organization',
        resourceId: id,
        summary: 'Organization restored',
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }

  updateStatus(id: string, status: OrganizationStatusValue, actorUserId?: string, actorUsername?: string): Organization {
    const org = this.repo.update(id, { status })
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'organization',
      resourceType: 'Organization',
      resourceId: org._id,
      summary: `Organization "${org.name}" status changed to ${status}`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return org
  }
}
