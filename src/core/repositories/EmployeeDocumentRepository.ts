import { EmployeeDocument, type EmployeeDocumentInput } from '../models/EmployeeDocument'
import {
  required,
  validateFields,
  type ValidationIssue,
} from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class EmployeeDocumentRepository extends BaseRepository<EmployeeDocument, EmployeeDocumentInput> {
  protected get objectType(): string {
    return 'EmployeeDocument'
  }

  protected get modelClass(): ModelConstructor<EmployeeDocument> {
    return EmployeeDocument
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      name: required('Document name'),
      type: required('Document type'),
      employeeId: required('Employee'),
    })
  }

  findByEmployee(employeeId: string, options: FindOptions = {}): EmployeeDocument[] {
    return this.query('employeeId == $0', [employeeId], options)
  }

  findByType(type: string, options: FindOptions = {}): EmployeeDocument[] {
    return this.query('type == $0', [type], options)
  }
}
