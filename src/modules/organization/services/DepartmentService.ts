/**
 * DepartmentService — business-layer facade for department management.
 */

import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import type { Department, DepartmentInput, DepartmentStatusValue } from '@/core/models/Department'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import { DepartmentRepository } from '@/core/repositories/DepartmentRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'

export class DepartmentService {
  private readonly repo = new DepartmentRepository()
  private readonly auditRepo = new AuditRepository()

  findAll(options: FindOptions = {}): Department[] {
    return this.repo.findAll(options)
  }

  findById(id: string): Department | null {
    return this.repo.findById(id)
  }

  findByBranch(branchId: string): Department[] {
    return this.repo.findByBranch(branchId)
  }

  count(): number {
    return this.repo.count()
  }

  create(input: DepartmentInput, actorUserId?: string, actorUsername?: string): Department {
    const dept = this.repo.create(input)
    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'organization',
      resourceType: 'Department',
      resourceId: dept._id,
      summary: `Department "${dept.name}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return dept
  }

  update(id: string, changes: Partial<DepartmentInput>, actorUserId?: string, actorUsername?: string): Department {
    const dept = this.repo.update(id, changes)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'organization',
      resourceType: 'Department',
      resourceId: dept._id,
      summary: `Department "${dept.name}" updated`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return dept
  }

  archive(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const dept = this.repo.findById(id)
    const result = this.repo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'organization',
        resourceType: 'Department',
        resourceId: id,
        summary: `Department "${dept?.name ?? id}" archived`,
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
        resourceType: 'Department',
        resourceId: id,
        summary: 'Department restored',
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }

  updateStatus(id: string, status: DepartmentStatusValue, actorUserId?: string, actorUsername?: string): Department {
    const dept = this.repo.update(id, { status })
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'organization',
      resourceType: 'Department',
      resourceId: dept._id,
      summary: `Department "${dept.name}" status changed to ${status}`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return dept
  }
}
