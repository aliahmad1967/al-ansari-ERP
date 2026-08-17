import {
  PurchaseRequest,
  type PurchaseRequestUpdate,
  type PurchaseRequestStatusValue,
} from '../models/PurchaseRequest'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class PurchaseRequestRepository extends BaseRepository<PurchaseRequest, PurchaseRequestUpdate> {
  protected get objectType(): string {
    return 'PurchaseRequest'
  }

  protected get modelClass(): ModelConstructor<PurchaseRequest> {
    return PurchaseRequest
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      code: required('Request code'),
      requestDate: required('Request date'),
      requestedByUserId: required('Requested by user'),
    })
  }

  findByStatus(status: PurchaseRequestStatusValue, options: FindOptions = {}): PurchaseRequest[] {
    return this.query('status == $0', [status], options)
  }

  findByUser(userId: string, options: FindOptions = {}): PurchaseRequest[] {
    return this.query('requestedByUserId == $0', [userId], options)
  }

  findByDepartment(departmentId: string, options: FindOptions = {}): PurchaseRequest[] {
    return this.query('departmentId == $0', [departmentId], options)
  }

  findPending(options: FindOptions = {}): PurchaseRequest[] {
    return this.query('status == $0', ['pending'], options)
  }
}
