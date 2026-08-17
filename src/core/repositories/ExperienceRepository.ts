import { Experience, type ExperienceInput } from '../models/Experience'
import {
  required,
  validateFields,
  type ValidationIssue,
} from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class ExperienceRepository extends BaseRepository<Experience, ExperienceInput> {
  protected get objectType(): string {
    return 'Experience'
  }

  protected get modelClass(): ModelConstructor<Experience> {
    return Experience
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      company: required('Company'),
      title: required('Title'),
      employeeId: required('Employee'),
    })
  }

  findByEmployee(employeeId: string, options: FindOptions = {}): Experience[] {
    return this.query('employeeId == $0', [employeeId], options)
  }
}
