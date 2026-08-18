import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import type { ProjectBudget, ProjectBudgetInput, ProjectBudgetStatusValue } from '@/core/models/ProjectBudget'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import { ProjectBudgetRepository } from '@/core/repositories/ProjectBudgetRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'

export class ProjectBudgetService {
  private readonly repo = new ProjectBudgetRepository()
  private readonly auditRepo = new AuditRepository()

  findAll(options: FindOptions = {}): ProjectBudget[] {
    return this.repo.findAll(options)
  }

  findById(id: string): ProjectBudget | null {
    return this.repo.findById(id)
  }

  count(): number {
    return this.repo.count()
  }

  findByProject(projectId: string, options?: FindOptions): ProjectBudget[] {
    return this.repo.findByProject(projectId, options)
  }

  create(input: ProjectBudgetInput, actorUserId?: string, actorUsername?: string): ProjectBudget {
    const budget = this.repo.create(input)
    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'projects',
      resourceType: 'ProjectBudget',
      resourceId: budget._id,
      summary: `Budget "${budget.name}" (${budget.allocatedAmount} SAR) created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return budget
  }

  update(id: string, changes: Partial<ProjectBudgetInput>, actorUserId?: string, actorUsername?: string): ProjectBudget {
    const budget = this.repo.update(id, changes)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'projects',
      resourceType: 'ProjectBudget',
      resourceId: budget._id,
      summary: `Budget "${budget.name}" updated`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return budget
  }

  archive(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const budget = this.repo.findById(id)
    const result = this.repo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'projects',
        resourceType: 'ProjectBudget',
        resourceId: id,
        summary: `Budget "${budget?.name ?? id}" archived`,
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
        resourceType: 'ProjectBudget',
        resourceId: id,
        summary: 'Budget restored',
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }

  updateStatus(id: string, status: ProjectBudgetStatusValue, actorUserId?: string, actorUsername?: string): ProjectBudget {
    const budget = this.repo.update(id, { status })
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'projects',
      resourceType: 'ProjectBudget',
      resourceId: budget._id,
      summary: `Budget "${budget.name}" status changed to ${status}`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return budget
  }

  getProjectBudgetSummary(projectId: string): {
    totalAllocated: number
    totalSpent: number
    remaining: number
    utilizationPercentage: number
    budgetCount: number
  } {
    const budgets = this.repo.findByProject(projectId)
    const totalAllocated = budgets.reduce((sum, b) => sum + b.allocatedAmount, 0)
    const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0)
    return {
      totalAllocated,
      totalSpent,
      remaining: totalAllocated - totalSpent,
      utilizationPercentage: totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0,
      budgetCount: budgets.length,
    }
  }
}
