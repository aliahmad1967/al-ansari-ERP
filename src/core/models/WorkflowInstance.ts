/**
 * WorkflowInstance — a running approval process for a specific entity.
 *
 * Each instance tracks:
 *  - which definition it follows
 *  - which entity it governs
 *  - the current step in the approval chain
 *  - overall status
 */

import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const WorkflowInstanceStatus = {
  Draft: 'draft',
  Pending: 'pending',
  Approved: 'approved',
  Rejected: 'rejected',
  Cancelled: 'cancelled',
  Completed: 'completed',
  Archived: 'archived',
} as const

export type WorkflowInstanceStatusValue =
  (typeof WorkflowInstanceStatus)[keyof typeof WorkflowInstanceStatus]

export interface WorkflowInstanceInput {
  definitionId: string
  entityType: string
  entityId: string
  currentStepOrder: number
  status?: WorkflowInstanceStatusValue
  initiatedByUserId: string
}

export interface WorkflowInstanceUpdate {
  currentStepOrder?: number
  status?: WorkflowInstanceStatusValue
  completedAt?: Date
}

export class WorkflowInstance extends Realm.Object<WorkflowInstance> {
  declare _id: string
  declare definitionId: string
  declare entityType: string
  declare entityId: string
  declare currentStepOrder: number
  declare status: WorkflowInstanceStatusValue
  declare initiatedByUserId: string
  declare initiatedAt: Date
  declare completedAt: Date | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'WorkflowInstance',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      definitionId: { type: 'string', indexed: true },
      entityType: { type: 'string', indexed: true },
      entityId: { type: 'string', indexed: true },
      currentStepOrder: { type: 'int', default: 1 },
      status: { type: 'string', default: WorkflowInstanceStatus.Draft },
      initiatedByUserId: { type: 'string', indexed: true },
      initiatedAt: { type: 'date' },
      completedAt: { type: 'date', optional: true },
    },
  }
}

export type WorkflowInstanceEntity = WorkflowInstance & SoftDeletableEntityFields
