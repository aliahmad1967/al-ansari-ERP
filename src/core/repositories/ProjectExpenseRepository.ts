import { ProjectExpense, type ProjectExpenseInput, type ProjectExpenseStatusValue, type ProjectExpenseCategoryValue } from '../models/ProjectExpense'
import { validateFields, required, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class ProjectExpenseRepository extends BaseRepository<ProjectExpense, ProjectExpenseInput> {
  protected get objectType(): string {
    return 'ProjectExpense'
  }

  protected get modelClass(): ModelConstructor<ProjectExpense> {
    return ProjectExpense
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return this.validateExpenseFields(values)
  }

  protected validateUpdate(values: Record<string, unknown>): ValidationIssue[] {
    return this.validateExpenseFields(values)
  }

  private validateExpenseFields(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      projectId: required('Project'),
      category: required('Category'),
      description: required('Description'),
      amount: required('Amount'),
      expenseDate: required('Expense date'),
    })
  }

  findByProject(projectId: string, options: FindOptions = {}): ProjectExpense[] {
    return this.query('projectId == $0', [projectId], { ...options, sortBy: options.sortBy ?? 'expenseDate', sortAscending: false })
  }

  findByTask(taskId: string, options: FindOptions = {}): ProjectExpense[] {
    return this.query('taskId == $0', [taskId], options)
  }

  findByEmployee(employeeId: string, options: FindOptions = {}): ProjectExpense[] {
    return this.query('employeeId == $0', [employeeId], options)
  }

  findByStatus(status: ProjectExpenseStatusValue, options: FindOptions = {}): ProjectExpense[] {
    return this.query('status == $0', [status], options)
  }

  findByCategory(category: ProjectExpenseCategoryValue, options: FindOptions = {}): ProjectExpense[] {
    return this.query('category == $0', [category], options)
  }

  findByProjectAndStatus(projectId: string, status: ProjectExpenseStatusValue, options: FindOptions = {}): ProjectExpense[] {
    return this.query('projectId == $0 AND status == $1', [projectId, status], options)
  }

  sumByProject(projectId: string, options: FindOptions = {}): number {
    const items = this.findByProject(projectId, options)
    return items.reduce((sum, e) => sum + e.amount, 0)
  }

  sumByProjectAndCategory(projectId: string, category: ProjectExpenseCategoryValue, options: FindOptions = {}): number {
    const items = this.query('projectId == $0 AND category == $1', [projectId, category], options)
    return items.reduce((sum, e) => sum + e.amount, 0)
  }
}
