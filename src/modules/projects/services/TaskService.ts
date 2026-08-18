import { AuditAction, AuditOutcome } from '@/core/models/AuditLog'
import type { Task, TaskInput, TaskStatusValue } from '@/core/models/Task'
import type { TaskComment, TaskCommentInput } from '@/core/models/TaskComment'
import { AuditRepository } from '@/core/repositories/AuditRepository'
import { TaskRepository } from '@/core/repositories/TaskRepository'
import { TaskCommentRepository } from '@/core/repositories/TaskCommentRepository'
import type { FindOptions } from '@/core/repositories/BaseRepository'

export class TaskService {
  private readonly taskRepo = new TaskRepository()
  private readonly commentRepo = new TaskCommentRepository()
  private readonly auditRepo = new AuditRepository()

  findAll(options: FindOptions = {}): Task[] {
    return this.taskRepo.findAll(options)
  }

  findById(id: string): Task | null {
    return this.taskRepo.findById(id)
  }

  count(): number {
    return this.taskRepo.count()
  }

  search(query: string): Task[] {
    return this.taskRepo.search(query)
  }

  findByProject(projectId: string, options?: FindOptions): Task[] {
    return this.taskRepo.findByProject(projectId, options)
  }

  findByAssignee(employeeId: string): Task[] {
    return this.taskRepo.findByAssignee(employeeId)
  }

  findByStatus(status: TaskStatusValue): Task[] {
    return this.taskRepo.findByStatus(status)
  }

  findOverdue(projectId?: string): Task[] {
    return this.taskRepo.findOverdue(projectId)
  }

  create(input: TaskInput, actorUserId?: string, actorUsername?: string): Task {
    const task = this.taskRepo.create(input)
    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'projects',
      resourceType: 'Task',
      resourceId: task._id,
      summary: `Task "${task.title}" created in project`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return task
  }

  update(id: string, changes: Partial<TaskInput>, actorUserId?: string, actorUsername?: string): Task {
    const task = this.taskRepo.update(id, changes)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'projects',
      resourceType: 'Task',
      resourceId: task._id,
      summary: `Task "${task.title}" updated`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return task
  }

  archive(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const task = this.taskRepo.findById(id)
    const result = this.taskRepo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'projects',
        resourceType: 'Task',
        resourceId: id,
        summary: `Task "${task?.title ?? id}" archived`,
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }

  restore(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const result = this.taskRepo.restore(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Update,
        module: 'projects',
        resourceType: 'Task',
        resourceId: id,
        summary: 'Task restored',
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }

  updateStatus(id: string, status: TaskStatusValue, actorUserId?: string, actorUsername?: string): Task {
    const changes: Partial<TaskInput> = { status }
    if (status === 'done') {
      changes.completedAt = new Date()
    }
    const task = this.taskRepo.update(id, changes)
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'projects',
      resourceType: 'Task',
      resourceId: task._id,
      summary: `Task "${task.title}" status changed to ${status}`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return task
  }

  logHours(taskId: string, hours: number, actorUserId?: string, actorUsername?: string): Task {
    const task = this.taskRepo.findById(taskId)
    if (!task) throw new Error('Task not found')
    const newLoggedHours = task.loggedHours + hours
    const updated = this.taskRepo.update(taskId, { loggedHours: newLoggedHours })
    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'projects',
      resourceType: 'Task',
      resourceId: taskId,
      summary: `${hours}h logged on task "${task.title}" (total: ${newLoggedHours}h)`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return updated
  }

  addComment(input: TaskCommentInput, actorUserId?: string, actorUsername?: string): TaskComment {
    const comment = this.commentRepo.create(input)
    this.auditRepo.create({
      action: AuditAction.Create,
      module: 'projects',
      resourceType: 'TaskComment',
      resourceId: comment._id,
      summary: `Comment added to task`,
      outcome: AuditOutcome.Success,
      actorUserId,
      actorUsername,
    })
    return comment
  }

  getComments(taskId: string): TaskComment[] {
    return this.commentRepo.findByTask(taskId)
  }

  deleteComment(id: string, actorUserId?: string, actorUsername?: string): boolean {
    const result = this.commentRepo.softDelete(id)
    if (result) {
      this.auditRepo.create({
        action: AuditAction.Delete,
        module: 'projects',
        resourceType: 'TaskComment',
        resourceId: id,
        summary: 'Comment deleted',
        outcome: AuditOutcome.Success,
        actorUserId,
        actorUsername,
      })
    }
    return result
  }
}
