/**
 * PermissionService — business-layer facade for permission management.
 */

import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import type { Permission, PermissionInput } from '@/core/models/Permission'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import { PermissionRepository } from '@/core/repositories/PermissionRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'

export class PermissionService {
  private readonly repo = new PermissionRepository()
  private readonly auditRepo = new AuditRepository()

  findAll(options: FindOptions = {}): Permission[] {
    return this.repo.findAll(options)
  }

  findById(id: string): Permission | null {
    return this.repo.findById(id)
  }

  findByModule(module: string): Permission[] {
    return this.repo.findByModule(module)
  }

  count(): number {
    return this.repo.count()
  }

  create(input: PermissionInput, actorUserId?: string, actorUsername?: string): Permission {
    const perm = this.repo.create(input)
    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'organization',
      resourceType: 'Permission',
      resourceId: perm._id,
      summary: `Permission "${perm.code}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return perm
  }

  update(id: string, changes: Partial<PermissionInput>, actorUserId?: string, actorUsername?: string): Permission {
    const perm = this.repo.update(id, changes)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'organization',
      resourceType: 'Permission',
      resourceId: perm._id,
      summary: `Permission "${perm.code}" updated`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return perm
  }
}
