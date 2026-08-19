/**
 * WorkflowActionRepository — persistence for workflow action audit records.
 */

import { WorkflowAction, type WorkflowActionInput } from '../models/WorkflowAction'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class WorkflowActionRepository extends BaseRepository<WorkflowAction, WorkflowActionInput> {
  protected get objectType(): string {
    return 'WorkflowAction'
  }

  protected get modelClass(): ModelConstructor<WorkflowAction> {
    return WorkflowAction
  }

  protected get supportsSoftDelete(): boolean {
    return false
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      instanceId: required('Instance id'),
      stepId: required('Step id'),
      action: required('Action'),
      actorUserId: required('Actor user id'),
    })
  }

  findByInstance(instanceId: string, options: FindOptions = {}): WorkflowAction[] {
    return this.query('instanceId == $0', [instanceId], {
      ...options,
      sortBy: 'createdAt',
      sortAscending: true,
    })
  }

  findByStep(stepId: string, options: FindOptions = {}): WorkflowAction[] {
    return this.query('stepId == $0', [stepId], {
      ...options,
      sortBy: 'createdAt',
      sortAscending: false,
    })
  }

  findByActor(actorUserId: string, options: FindOptions = {}): WorkflowAction[] {
    return this.query('actorUserId == $0', [actorUserId], {
      ...options,
      sortBy: 'createdAt',
      sortAscending: false,
    })
  }

  findLastActionForInstance(instanceId: string): WorkflowAction | null {
    return this.first('instanceId == $0', [instanceId], {
      sortBy: 'createdAt',
      sortAscending: false,
    })
  }
}
