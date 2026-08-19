/**
 * WorkflowAction — an immutable audit record of a workflow action.
 *
 * Every approval, rejection, submission, or cancellation is recorded
 * as a WorkflowAction. These are append-only and never modified.
 */

import Realm from 'realm'

import { BASE_PROPERTIES } from './base'

export const WorkflowActionType = {
  Submit: 'submit',
  Approve: 'approve',
  Reject: 'reject',
  Cancel: 'cancel',
  Return: 'return',
} as const

export type WorkflowActionTypeValue = (typeof WorkflowActionType)[keyof typeof WorkflowActionType]

export interface WorkflowActionInput {
  instanceId: string
  stepId: string
  action: WorkflowActionTypeValue
  actorUserId: string
  actorUsername?: string
  comment?: string
}

export class WorkflowAction extends Realm.Object<WorkflowAction> {
  declare _id: string
  declare instanceId: string
  declare stepId: string
  declare action: WorkflowActionTypeValue
  declare actorUserId: string
  declare actorUsername: string | null
  declare comment: string | null
  declare createdAt: Date
  declare updatedAt: Date

  static schema: Realm.ObjectSchema = {
    name: 'WorkflowAction',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      instanceId: { type: 'string', indexed: true },
      stepId: { type: 'string', indexed: true },
      action: { type: 'string', indexed: true },
      actorUserId: { type: 'string', indexed: true },
      actorUsername: { type: 'string', optional: true },
      comment: { type: 'string', optional: true },
    },
  }
}

export type WorkflowActionEntity = WorkflowAction
