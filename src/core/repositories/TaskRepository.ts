import { Task, type TaskInput, type TaskStatusValue } from '../models/Task'
import { validateFields, required, minLength, maxLength, combineValidators, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class TaskRepository extends BaseRepository<Task, TaskInput> {
  protected get objectType(): string {
    return 'Task'
  }

  protected get modelClass(): ModelConstructor<Task> {
    return Task
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    const issues = this.validateTaskFields(values)
    const exceptId = typeof values['_id'] === 'string' ? values['_id'] : undefined
    if (typeof values['taskCode'] === 'string' && this.existsByCode(values['taskCode'], exceptId)) {
      issues.push({ field: 'taskCode', message: 'Task code is already in use.' })
    }
    return issues
  }

  protected validateUpdate(values: Record<string, unknown>): ValidationIssue[] {
    return this.validateTaskFields(values)
  }

  private validateTaskFields(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      taskCode: combineValidators(required('Task code'), minLength('Task code', 2), maxLength('Task code', 32)),
      title: required('Task title'),
      projectId: required('Project'),
    })
  }

  private existsByCode(taskCode: string, exceptId?: string): boolean {
    const results = this.getRealm().objects(Task).filtered('taskCode == $0', taskCode)
    for (const candidate of results) {
      if (candidate._id !== exceptId && !this.isSoftDeleted(candidate)) return true
    }
    return false
  }

  findByProject(projectId: string, options: FindOptions = {}): Task[] {
    return this.query('projectId == $0', [projectId], options)
  }

  findByMilestone(milestoneId: string, options: FindOptions = {}): Task[] {
    return this.query('milestoneId == $0', [milestoneId], options)
  }

  findByAssignee(employeeId: string, options: FindOptions = {}): Task[] {
    return this.query('assignedToId == $0', [employeeId], options)
  }

  findByStatus(status: TaskStatusValue, options: FindOptions = {}): Task[] {
    return this.query('status == $0', [status], options)
  }

  findByProjectAndStatus(projectId: string, status: TaskStatusValue, options: FindOptions = {}): Task[] {
    return this.query('projectId == $0 AND status == $1', [projectId, status], options)
  }

  findSubtasks(parentTaskId: string, options: FindOptions = {}): Task[] {
    return this.query('parentTaskId == $0', [parentTaskId], options)
  }

  findOverdue(projectId?: string, options: FindOptions = {}): Task[] {
    const now = new Date()
    if (projectId) {
      return this.query(
        'projectId == $0 AND dueDate < $1 AND status != $2 AND status != $3',
        [projectId, now, 'done', 'cancelled'],
        options,
      )
    }
    return this.query(
      'dueDate < $0 AND status != $1 AND status != $2',
      [now, 'done', 'cancelled'],
      options,
    )
  }

  search(query: string, options: FindOptions = {}): Task[] {
    const q = query.toLowerCase()
    return this.query(
      'title CONTAINS[c] $0 || titleAr CONTAINS[c] $0 || taskCode CONTAINS[c] $0 || description CONTAINS[c] $0',
      [q],
      options,
    )
  }
}
