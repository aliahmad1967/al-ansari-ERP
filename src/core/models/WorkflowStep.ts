/**
 * WorkflowStep — a single approval level within a WorkflowDefinition.
 *
 * Steps are ordered sequentially. Each step specifies who can approve:
 *  - role-based: anyone with the specified role
 *  - user-based: a specific user
 *  - department-manager: the manager of the requesting user's department
 */

import Realm from 'realm'

import { BASE_PROPERTIES } from './base'

export const WorkflowStepApproverType = {
  Role: 'role',
  User: 'user',
  DepartmentManager: 'department_manager',
} as const

export type WorkflowStepApproverTypeValue =
  (typeof WorkflowStepApproverType)[keyof typeof WorkflowStepApproverType]

export const WorkflowStepActionType = {
  Approve: 'approve',
  Review: 'review',
  Notify: 'notify',
} as const

export type WorkflowStepActionTypeValue =
  (typeof WorkflowStepActionType)[keyof typeof WorkflowStepActionType]

export interface WorkflowStepInput {
  definitionId: string
  orderNumber: number
  name: string
  nameAr?: string
  approverType: WorkflowStepApproverTypeValue
  approverRoleId?: string
  approverUserId?: string
  actionType?: WorkflowStepActionTypeValue
}

export interface WorkflowStepUpdate {
  orderNumber?: number
  name?: string
  nameAr?: string
  approverType?: WorkflowStepApproverTypeValue
  approverRoleId?: string
  approverUserId?: string
  actionType?: WorkflowStepActionTypeValue
}

export class WorkflowStep extends Realm.Object<WorkflowStep> {
  declare _id: string
  declare definitionId: string
  declare orderNumber: number
  declare name: string
  declare nameAr: string | null
  declare approverType: WorkflowStepApproverTypeValue
  declare approverRoleId: string | null
  declare approverUserId: string | null
  declare actionType: WorkflowStepActionTypeValue
  declare createdAt: Date
  declare updatedAt: Date

  static schema: Realm.ObjectSchema = {
    name: 'WorkflowStep',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      definitionId: { type: 'string', indexed: true },
      orderNumber: { type: 'int' },
      name: 'string',
      nameAr: { type: 'string', optional: true },
      approverType: { type: 'string' },
      approverRoleId: { type: 'string', optional: true },
      approverUserId: { type: 'string', optional: true },
      actionType: { type: 'string', default: WorkflowStepActionType.Approve },
    },
  }
}

export type WorkflowStepEntity = WorkflowStep
