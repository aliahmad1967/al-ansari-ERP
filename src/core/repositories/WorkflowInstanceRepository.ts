/**
 * WorkflowInstanceRepository — persistence for workflow instances.
 */

import { WorkflowInstance, type WorkflowInstanceInput, WorkflowInstanceStatus } from '../models/WorkflowInstance'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class WorkflowInstanceRepository extends BaseRepository<
  WorkflowInstance,
  WorkflowInstanceInput
> {
  protected get objectType(): string {
    return 'WorkflowInstance'
  }

  protected get modelClass(): ModelConstructor<WorkflowInstance> {
    return WorkflowInstance
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      definitionId: required('Definition id'),
      entityType: required('Entity type'),
      entityId: required('Entity id'),
      initiatedByUserId: required('Initiated by user id'),
    })
  }

  protected validateUpdate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      status: values['status'] !== undefined ? required('Status') : undefined,
    })
  }

  findByEntity(entityType: string, entityId: string): WorkflowInstance | null {
    return this.first('entityType == $0 AND entityId == $1', [entityType, entityId])
  }

  findByDefinition(definitionId: string, options: FindOptions = {}): WorkflowInstance[] {
    return this.query('definitionId == $0', [definitionId], {
      ...options,
      sortBy: 'createdAt',
      sortAscending: false,
    })
  }

  findByStatus(status: WorkflowInstanceStatusValue, options: FindOptions = {}): WorkflowInstance[] {
    return this.query('status == $0', [status], {
      ...options,
      sortBy: 'createdAt',
      sortAscending: false,
    })
  }

  findByInitiator(userId: string, options: FindOptions = {}): WorkflowInstance[] {
    return this.query('initiatedByUserId == $0', [userId], {
      ...options,
      sortBy: 'createdAt',
      sortAscending: false,
    })
  }

  findPendingForEntity(entityType: string, entityId: string): WorkflowInstance | null {
    return this.first(
      'entityType == $0 AND entityId == $1 AND status == $2',
      [entityType, entityId, WorkflowInstanceStatus.Pending],
    )
  }
}

type WorkflowInstanceStatusValue = (typeof WorkflowInstanceStatus)[keyof typeof WorkflowInstanceStatus]
