import { ProjectMember, type ProjectMemberInput, type ProjectMemberRoleValue } from '../models/ProjectMember'
import { validateFields, required, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class ProjectMemberRepository extends BaseRepository<ProjectMember, ProjectMemberInput> {
  protected get objectType(): string {
    return 'ProjectMember'
  }

  protected get modelClass(): ModelConstructor<ProjectMember> {
    return ProjectMember
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    const issues = this.validateMemberFields(values)
    if (typeof values['projectId'] === 'string' && typeof values['employeeId'] === 'string') {
      if (this.isAlreadyMember(values['projectId'] as string, values['employeeId'] as string, typeof values['_id'] === 'string' ? values['_id'] : undefined)) {
        issues.push({ field: 'employeeId', message: 'Employee is already a member of this project.' })
      }
    }
    return issues
  }

  protected validateUpdate(values: Record<string, unknown>): ValidationIssue[] {
    return this.validateMemberFields(values)
  }

  private validateMemberFields(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      projectId: required('Project'),
      employeeId: required('Employee'),
    })
  }

  private isAlreadyMember(projectId: string, employeeId: string, exceptId?: string): boolean {
    const results = this.getRealm().objects(ProjectMember).filtered('projectId == $0 AND employeeId == $1', projectId, employeeId)
    for (const candidate of results) {
      if (candidate._id !== exceptId && !this.isSoftDeleted(candidate)) return true
    }
    return false
  }

  findByProject(projectId: string, options: FindOptions = {}): ProjectMember[] {
    return this.query('projectId == $0', [projectId], options)
  }

  findByEmployee(employeeId: string, options: FindOptions = {}): ProjectMember[] {
    return this.query('employeeId == $0', [employeeId], options)
  }

  findByProjectAndRole(projectId: string, role: ProjectMemberRoleValue, options: FindOptions = {}): ProjectMember[] {
    return this.query('projectId == $0 AND role == $1', [projectId, role], options)
  }

  findByProjectAndEmployee(projectId: string, employeeId: string): ProjectMember | null {
    return this.first('projectId == $0 AND employeeId == $1', [projectId, employeeId])
  }
}
