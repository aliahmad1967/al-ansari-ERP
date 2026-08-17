import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const PurchaseOrderStatus = {
  Draft: 'draft',
  Submitted: 'submitted',
  Confirmed: 'confirmed',
  PartiallyReceived: 'partially_received',
  Received: 'received',
  Cancelled: 'cancelled',
} as const

export type PurchaseOrderStatusValue =
  (typeof PurchaseOrderStatus)[keyof typeof PurchaseOrderStatus]

export interface PurchaseOrderInput {
  code: string
  orderDate: Date
  supplierId: string
  purchaseRequestId?: string
  expectedDeliveryDate?: Date
  notes?: string
  totalAmount?: number
  taxAmount?: number
  discountAmount?: number
  netAmount?: number
  currency?: string
  status?: PurchaseOrderStatusValue
}

export class PurchaseOrder extends Realm.Object<PurchaseOrder> {
  declare _id: string
  declare code: string
  declare orderDate: Date
  declare supplierId: string
  declare purchaseRequestId: string | null
  declare expectedDeliveryDate: Date | null
  declare status: PurchaseOrderStatusValue
  declare totalAmount: number
  declare taxAmount: number
  declare discountAmount: number
  declare netAmount: number
  declare currency: string
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'PurchaseOrder',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      orderDate: { type: 'date' },
      supplierId: { type: 'string', indexed: true },
      purchaseRequestId: { type: 'string', optional: true },
      expectedDeliveryDate: { type: 'date', optional: true },
      status: { type: 'string', default: PurchaseOrderStatus.Draft },
      totalAmount: { type: 'double', default: 0 },
      taxAmount: { type: 'double', default: 0 },
      discountAmount: { type: 'double', default: 0 },
      netAmount: { type: 'double', default: 0 },
      currency: { type: 'string', default: 'SAR' },
      notes: { type: 'string', optional: true },
    },
  }
}

export type PurchaseOrderEntity = PurchaseOrder & SoftDeletableEntityFields
