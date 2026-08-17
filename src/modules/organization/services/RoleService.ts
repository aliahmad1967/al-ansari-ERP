/**
 * RoleService — business-layer facade for role management.
 */

import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import type { Role, RoleInput } from '@/core/models/Role'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import { RoleRepository } from '@/core/repositories/RoleRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'

export class RoleService {
  private readonly repo = new RoleRepository()
  private readonly auditRepo = new AuditRepository()

  findAll(options: FindOptions = {}): Role[] {
    return this.repo.findAll(options)
  }

  findById(id: string): Role | null {
    return this.repo.findById(id)
  }

  findByCode(code: string): Role | null {
    return this.repo.findByCode(code)
  }

  count(): number {
    return this.repo.count()
  }

  create(input: RoleInput, actorUserId?: string, actorUsername?: string): Role {
    const role = this.repo.create(input)
    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'organization',
      resourceType: 'Role',
      resourceId: role._id,
      summary: `Role "${role.name}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return role
  }

  update(id: string, changes: Partial<RoleInput>, actorUserId?: string, actorUsername?: string): Role {
    const role = this.repo.update(id, changes)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'organization',
      resourceType: 'Role',
      resourceId: role._id,
      summary: `Role "${role.name}" updated`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return role
  }

  archive(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const role = this.repo.findById(id)
    if (role?.isSystem) return false
    const result = this.repo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'organization',
        resourceType: 'Role',
        resourceId: id,
        summary: `Role "${role?.name ?? id}" archived`,
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
        resourceType: 'Role',
        resourceId: id,
        summary: 'Role restored',
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }
}
