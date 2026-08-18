import { Milestone, type MilestoneInput, type MilestoneStatusValue } from '../models/Milestone'
import { validateFields, required, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class MilestoneRepository extends BaseRepository<Milestone, MilestoneInput> {
  protected get objectType(): string {
    return 'Milestone'
  }

  protected get modelClass(): ModelConstructor<Milestone> {
    return Milestone
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return this.validateMilestoneFields(values)
  }

  protected validateUpdate(values: Record<string, unknown>): ValidationIssue[] {
    return this.validateMilestoneFields(values)
  }

  private validateMilestoneFields(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      projectId: required('Project'),
      name: required('Milestone name'),
      dueDate: required('Due date'),
    })
  }

  findByProject(projectId: string, options: FindOptions = {}): Milestone[] {
    return this.query('projectId == $0', [projectId], { ...options, sortBy: options.sortBy ?? 'dueDate', sortAscending: options.sortAscending ?? true })
  }

  findByStatus(status: MilestoneStatusValue, options: FindOptions = {}): Milestone[] {
    return this.query('status == $0', [status], options)
  }

  findByProjectAndStatus(projectId: string, status: MilestoneStatusValue, options: FindOptions = {}): Milestone[] {
    return this.query('projectId == $0 AND status == $1', [projectId, status], options)
  }

  findOverdue(projectId?: string, options: FindOptions = {}): Milestone[] {
    const now = new Date()
    if (projectId) {
      return this.query(
        'projectId == $0 AND dueDate < $1 AND status != $2',
        [projectId, now, 'achieved'],
        options,
      )
    }
    return this.query('dueDate < $0 AND status != $1', [now, 'achieved'], options)
  }

  search(query: string, options: FindOptions = {}): Milestone[] {
    const q = query.toLowerCase()
    return this.query(
      'name CONTAINS[c] $0 || nameAr CONTAINS[c] $0 || description CONTAINS[c] $0',
      [q],
      options,
    )
  }
}
