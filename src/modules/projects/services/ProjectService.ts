import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import type { Project, ProjectInput, ProjectStatusValue } from '@/core/models/Project'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import { ProjectRepository } from '@/core/repositories/ProjectRepository'
import { ProjectMemberRepository } from '@/core/repositories/ProjectMemberRepository'
import { TaskRepository } from '@/core/repositories/TaskRepository'
import { TimesheetRepository } from '@/core/repositories/TimesheetRepository'
import { ProjectExpenseRepository } from '@/core/repositories/ProjectExpenseRepository'
import { ProjectBudgetRepository } from '@/core/repositories/ProjectBudgetRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'

export class ProjectService {
  private readonly repo = new ProjectRepository()
  private readonly memberRepo = new ProjectMemberRepository()
  private readonly taskRepo = new TaskRepository()
  private readonly timesheetRepo = new TimesheetRepository()
  private readonly expenseRepo = new ProjectExpenseRepository()
  private readonly budgetRepo = new ProjectBudgetRepository()
  private readonly auditRepo = new AuditRepository()

  findAll(options: FindOptions = {}): Project[] {
    return this.repo.findAll(options)
  }

  findById(id: string): Project | null {
    return this.repo.findById(id)
  }

  count(): number {
    return this.repo.count()
  }

  search(query: string): Project[] {
    return this.repo.search(query)
  }

  findActive(): Project[] {
    return this.repo.findActive()
  }

  findByManager(managerId: string): Project[] {
    return this.repo.findByManager(managerId)
  }

  findByStatus(status: ProjectStatusValue): Project[] {
    return this.repo.findByStatus(status)
  }

  create(input: ProjectInput, actorUserId?: string, actorUsername?: string): Project {
    const project = this.repo.create(input)
    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'projects',
      resourceType: 'Project',
      resourceId: project._id,
      summary: `Project "${project.name}" created`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return project
  }

  update(id: string, changes: Partial<ProjectInput>, actorUserId?: string, actorUsername?: string): Project {
    const project = this.repo.update(id, changes)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'projects',
      resourceType: 'Project',
      resourceId: project._id,
      summary: `Project "${project.name}" updated`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return project
  }

  archive(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const project = this.repo.findById(id)
    const result = this.repo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'projects',
        resourceType: 'Project',
        resourceId: id,
        summary: `Project "${project?.name ?? id}" archived`,
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
        resourceType: 'Project',
        resourceId: id,
        summary: 'Project restored',
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }

  updateStatus(id: string, status: ProjectStatusValue, actorUserId?: string, actorUsername?: string): Project {
    const project = this.repo.update(id, { status })
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'projects',
      resourceType: 'Project',
      resourceId: project._id,
      summary: `Project "${project.name}" status changed to ${status}`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return project
  }

  getProjectStats(projectId: string): {
    totalTasks: number
    completedTasks: number
    totalMembers: number
    totalHours: number
    totalExpenses: number
    totalBudget: number
    totalSpent: number
  } {
    const tasks = this.taskRepo.findByProject(projectId)
    const members = this.memberRepo.findByProject(projectId)
    const hours = this.timesheetRepo.sumHoursByProject(projectId)
    const expenses = this.expenseRepo.sumByProject(projectId)
    const totalBudget = this.budgetRepo.totalAllocatedByProject(projectId)
    const totalSpent = this.budgetRepo.totalSpentByProject(projectId)

    return {
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.status === 'done').length,
      totalMembers: members.length,
      totalHours: hours,
      totalExpenses: expenses,
      totalBudget,
      totalSpent,
    }
  }
}
