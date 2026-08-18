import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import type { Milestone, MilestoneInput, MilestoneStatusValue } from '@/core/models/Milestone'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import { MilestoneRepository } from '@/core/repositories/MilestoneRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'

export class MilestoneService {
  private readonly repo = new MilestoneRepository()
  private readonly auditRepo = new AuditRepository()

  findAll(options: FindOptions = {}): Milestone[] {
    return this.repo.findAll(options)
  }

  findById(id: string): Milestone | null {
    return this.repo.findById(id)
  }

  count(): number {
    return this.repo.count()
  }

  search(query: string): Milestone[] {
    return this.repo.search(query)
  }

  findByProject(projectId: string, options?: FindOptions): Milestone[] {
    return this.repo.findByProject(projectId, options)
  }

  findOverdue(projectId?: string): Milestone[] {
    return this.repo.findOverdue(projectId)
  }

  create(input: MilestoneInput, actorUserId?: string, actorUsername?: string): Milestone {
    const milestone = this.repo.create(input)
    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'projects',
      resourceType: 'Milestone',
      resourceId: milestone._id,
      summary: `Milestone "${milestone.name}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return milestone
  }

  update(id: string, changes: Partial<MilestoneInput>, actorUserId?: string, actorUsername?: string): Milestone {
    const milestone = this.repo.update(id, changes)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'projects',
      resourceType: 'Milestone',
      resourceId: milestone._id,
      summary: `Milestone "${milestone.name}" updated`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return milestone
  }

  archive(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const milestone = this.repo.findById(id)
    const result = this.repo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'projects',
        resourceType: 'Milestone',
        resourceId: id,
        summary: `Milestone "${milestone?.name ?? id}" archived`,
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
        module: 'projects',
        resourceType: 'Milestone',
        resourceId: id,
        summary: 'Milestone restored',
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }

  updateStatus(id: string, status: MilestoneStatusValue, actorUserId?: string, actorUsername?: string): Milestone {
    const changes: Partial<MilestoneInput> = { status }
    if (status === 'achieved') {
      changes.completedAt = new Date()
    }
    const milestone = this.repo.update(id, changes)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'projects',
      resourceType: 'Milestone',
      resourceId: milestone._id,
      summary: `Milestone "${milestone.name}" status changed to ${status}`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return milestone
  }
}
