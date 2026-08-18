import { ProjectBudget, type ProjectBudgetInput, type ProjectBudgetStatusValue } from '../models/ProjectBudget'
import { validateFields, required, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class ProjectBudgetRepository extends BaseRepository<ProjectBudget, ProjectBudgetInput> {
  protected get objectType(): string {
    return 'ProjectBudget'
  }

  protected get modelClass(): ModelConstructor<ProjectBudget> {
    return ProjectBudget
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return this.validateBudgetFields(values)
  }

  protected validateUpdate(values: Record<string, unknown>): ValidationIssue[] {
    return this.validateBudgetFields(values)
  }

  private validateBudgetFields(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      projectId: required('Project'),
      name: required('Budget name'),
      category: required('Category'),
      allocatedAmount: required('Allocated amount'),
    })
  }

  findByProject(projectId: string, options: FindOptions = {}): ProjectBudget[] {
    return this.query('projectId == $0', [projectId], options)
  }

  findByStatus(status: ProjectBudgetStatusValue, options: FindOptions = {}): ProjectBudget[] {
    return this.query('status == $0', [status], options)
  }

  findByProjectAndStatus(projectId: string, status: ProjectBudgetStatusValue, options: FindOptions = {}): ProjectBudget[] {
    return this.query('projectId == $0 AND status == $1', [projectId, status], options)
  }

  findByCategory(category: string, options: FindOptions = {}): ProjectBudget[] {
    return this.query('category == $0', [category], options)
  }

  totalAllocatedByProject(projectId: string): number {
    const items = this.findByProject(projectId)
    return items.reduce((sum, b) => sum + b.allocatedAmount, 0)
  }

  totalSpentByProject(projectId: string): number {
    const items = this.findByProject(projectId)
    return items.reduce((sum, b) => sum + b.spentAmount, 0)
  }
}
