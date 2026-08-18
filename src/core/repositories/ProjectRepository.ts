import { Project, type ProjectInput, type ProjectStatusValue } from '../models/Project'
import { validateFields, required, minLength, maxLength, combineValidators, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class ProjectRepository extends BaseRepository<Project, ProjectInput> {
  protected get objectType(): string {
    return 'Project'
  }

  protected get modelClass(): ModelConstructor<Project> {
    return Project
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    const issues = this.validateProjectFields(values)
    const exceptId = typeof values['_id'] === 'string' ? values['_id'] : undefined
    if (typeof values['projectCode'] === 'string' && this.existsByCode(values['projectCode'], exceptId)) {
      issues.push({ field: 'projectCode', message: 'Project code is already in use.' })
    }
    return issues
  }

  protected validateUpdate(values: Record<string, unknown>): ValidationIssue[] {
    return this.validateProjectFields(values)
  }

  private validateProjectFields(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      projectCode: combineValidators(required('Project code'), minLength('Project code', 2), maxLength('Project code', 32)),
      name: required('Project name'),
    })
  }

  private existsByCode(projectCode: string, exceptId?: string): boolean {
    const results = this.getRealm().objects(Project).filtered('projectCode == $0', projectCode)
    for (const candidate of results) {
      if (candidate._id !== exceptId && !this.isSoftDeleted(candidate)) return true
    }
    return false
  }

  findByCode(code: string, options: FindOptions = {}): Project | null {
    return this.first('projectCode == $0', [code], options)
  }

  findByStatus(status: ProjectStatusValue, options: FindOptions = {}): Project[] {
    return this.query('status == $0', [status], options)
  }

  findByManager(managerId: string, options: FindOptions = {}): Project[] {
    return this.query('managerId == $0', [managerId], options)
  }

  findByCustomer(customerId: string, options: FindOptions = {}): Project[] {
    return this.query('customerId == $0', [customerId], options)
  }

  findByOrganization(organizationId: string, options: FindOptions = {}): Project[] {
    return this.query('organizationId == $0', [organizationId], options)
  }

  findByDepartment(departmentId: string, options: FindOptions = {}): Project[] {
    return this.query('departmentId == $0', [departmentId], options)
  }

  search(query: string, options: FindOptions = {}): Project[] {
    const q = query.toLowerCase()
    return this.query(
      'name CONTAINS[c] $0 || nameAr CONTAINS[c] $0 || projectCode CONTAINS[c] $0 || description CONTAINS[c] $0',
      [q],
      options,
    )
  }

  findActive(options: FindOptions = {}): Project[] {
    return this.query('status == $0', ['active'], options)
  }
}
