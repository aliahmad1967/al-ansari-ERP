import { EmergencyContact, type EmergencyContactInput } from '../models/EmergencyContact'
import {
  required,
  validateFields,
  type ValidationIssue,
} from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class EmergencyContactRepository extends BaseRepository<EmergencyContact, EmergencyContactInput> {
  protected get objectType(): string {
    return 'EmergencyContact'
  }

  protected get modelClass(): ModelConstructor<EmergencyContact> {
    return EmergencyContact
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      name: required('Contact name'),
      phone: required('Phone'),
      relationship: required('Relationship'),
      employeeId: required('Employee'),
    })
  }

  findByEmployee(employeeId: string, options: FindOptions = {}): EmergencyContact[] {
    return this.query('employeeId == $0', [employeeId], options)
  }
}
