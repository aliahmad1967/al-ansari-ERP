/**
 * PositionService — business-layer facade for position management.
 */

import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import type { Position, PositionInput, PositionStatusValue } from '@/core/models/Position'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import { PositionRepository } from '@/core/repositories/PositionRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'

export class PositionService {
  private readonly repo = new PositionRepository()
  private readonly auditRepo = new AuditRepository()

  findAll(options: FindOptions = {}): Position[] {
    return this.repo.findAll(options)
  }

  findById(id: string): Position | null {
    return this.repo.findById(id)
  }

  findByDepartment(departmentId: string): Position[] {
    return this.repo.findByDepartment(departmentId)
  }

  count(): number {
    return this.repo.count()
  }

  create(input: PositionInput, actorUserId?: string, actorUsername?: string): Position {
    const pos = this.repo.create(input)
    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'organization',
      resourceType: 'Position',
      resourceId: pos._id,
      summary: `Position "${pos.title}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return pos
  }

  update(id: string, changes: Partial<PositionInput>, actorUserId?: string, actorUsername?: string): Position {
    const pos = this.repo.update(id, changes)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'organization',
      resourceType: 'Position',
      resourceId: pos._id,
      summary: `Position "${pos.title}" updated`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return pos
  }

  archive(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const pos = this.repo.findById(id)
    const result = this.repo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'organization',
        resourceType: 'Position',
        resourceId: id,
        summary: `Position "${pos?.title ?? id}" archived`,
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
        resourceType: 'Position',
        resourceId: id,
        summary: 'Position restored',
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }

  updateStatus(id: string, status: PositionStatusValue, actorUserId?: string, actorUsername?: string): Position {
    const pos = this.repo.update(id, { status })
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'organization',
      resourceType: 'Position',
      resourceId: pos._id,
      summary: `Position "${pos.title}" status changed to ${status}`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return pos
  }
}
