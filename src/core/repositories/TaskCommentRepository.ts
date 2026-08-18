import { TaskComment, type TaskCommentInput } from '../models/TaskComment'
import { validateFields, required, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class TaskCommentRepository extends BaseRepository<TaskComment, TaskCommentInput> {
  protected get objectType(): string {
    return 'TaskComment'
  }

  protected get modelClass(): ModelConstructor<TaskComment> {
    return TaskComment
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return this.validateCommentFields(values)
  }

  protected validateUpdate(values: Record<string, unknown>): ValidationIssue[] {
    return this.validateCommentFields(values)
  }

  private validateCommentFields(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      taskId: required('Task'),
      projectId: required('Project'),
      authorId: required('Author'),
      content: required('Comment content'),
    })
  }

  findByTask(taskId: string, options: FindOptions = {}): TaskComment[] {
    return this.query('taskId == $0', [taskId], { ...options, sortBy: options.sortBy ?? 'createdAt', sortAscending: options.sortAscending ?? true })
  }

  findByProject(projectId: string, options: FindOptions = {}): TaskComment[] {
    return this.query('projectId == $0', [projectId], options)
  }

  findByAuthor(authorId: string, options: FindOptions = {}): TaskComment[] {
    return this.query('authorId == $0', [authorId], options)
  }
}
