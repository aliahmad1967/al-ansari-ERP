import Realm from 'realm'

import { BASE_PROPERTIES } from './base'
import { ApprovalLevel, type ApprovalLevelValue, ApprovalAction, type ApprovalActionValue } from './ApprovalLevel'

export { ApprovalLevel, ApprovalAction }
export type { ApprovalLevelValue, ApprovalActionValue }

export interface LeaveApprovalInput {
  leaveRequestId: string
  level: ApprovalLevelValue
  action: ApprovalActionValue
  approverUserId: string
  approverUsername?: string
  comment?: string
}

export class LeaveApproval extends Realm.Object<LeaveApproval> {
  declare _id: string
  declare leaveRequestId: string
  declare level: ApprovalLevelValue
  declare action: ApprovalActionValue
  declare approverUserId: string
  declare approverUsername: string | null
  declare comment: string | null
  declare createdAt: Date

  static schema: Realm.ObjectSchema = {
    name: 'LeaveApproval',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      leaveRequestId: { type: 'string', indexed: true },
      level: 'string',
      action: 'string',
      approverUserId: 'string',
      approverUsername: { type: 'string', optional: true },
      comment: { type: 'string', optional: true },
    },
  }
}

export type LeaveApprovalEntity = LeaveApproval
