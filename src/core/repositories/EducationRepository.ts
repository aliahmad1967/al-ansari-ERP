import { Education, type EducationInput } from '../models/Education'
import {
  required,
  validateFields,
  type ValidationIssue,
} from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class EducationRepository extends BaseRepository<Education, EducationInput> {
  protected get objectType(): string {
    return 'Education'
  }

  protected get modelClass(): ModelConstructor<Education> {
    return Education
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      institution: required('Institution'),
      degree: required('Degree'),
      fieldOfStudy: required('Field of study'),
      employeeId: required('Employee'),
    })
  }

  findByEmployee(employeeId: string, options: FindOptions = {}): Education[] {
    return this.query('employeeId == $0', [employeeId], options)
  }
}
