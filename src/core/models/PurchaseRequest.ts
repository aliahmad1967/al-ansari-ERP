import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const PurchaseRequestStatus = {
  Draft: 'draft',
  PendingApproval: 'pending_approval',
  Approved: 'approved',
  Rejected: 'rejected',
  Converted: 'converted',
  Cancelled: 'cancelled',
} as const

export type PurchaseRequestStatusValue =
  (typeof PurchaseRequestStatus)[keyof typeof PurchaseRequestStatus]

export interface PurchaseRequestInput {
  code: string
  requestDate: Date
  requestedByUserId: string
  departmentId?: string
  notes?: string
  totalEstimatedCost?: number
  status?: PurchaseRequestStatusValue
}

export interface PurchaseRequestUpdate {
  code?: string
  requestDate?: Date
  requestedByUserId?: string
  departmentId?: string
  notes?: string
  totalEstimatedCost?: number
  status?: PurchaseRequestStatusValue
  approvedByUserId?: string
  approvedAt?: Date
  rejectionReason?: string
}

export class PurchaseRequest extends Realm.Object<PurchaseRequest> {
  declare _id: string
  declare code: string
  declare requestDate: Date
  declare requestedByUserId: string
  declare departmentId: string | null
  declare status: PurchaseRequestStatusValue
  declare notes: string | null
  declare totalEstimatedCost: number
  declare approvedByUserId: string | null
  declare approvedAt: Date | null
  declare rejectionReason: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'PurchaseRequest',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      requestDate: { type: 'date' },
      requestedByUserId: { type: 'string', indexed: true },
      departmentId: { type: 'string', optional: true },
      status: { type: 'string', default: PurchaseRequestStatus.Draft },
      notes: { type: 'string', optional: true },
      totalEstimatedCost: { type: 'double', default: 0 },
      approvedByUserId: { type: 'string', optional: true },
      approvedAt: { type: 'date', optional: true },
      rejectionReason: { type: 'string', optional: true },
    },
  }
}

export type PurchaseRequestEntity = PurchaseRequest & SoftDeletableEntityFields
