import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const DeliveryStatus = {
  Draft: 'draft',
  Packed: 'packed',
  Shipped: 'shipped',
  Delivered: 'delivered',
  Cancelled: 'cancelled',
} as const

export type DeliveryStatusValue = (typeof DeliveryStatus)[keyof typeof DeliveryStatus]

export interface DeliveryInput {
  code: string
  deliveryDate: Date
  salesOrderId: string
  customerId: string
  warehouseId: string
  shippedByUserId?: string
  trackingNumber?: string
  carrierName?: string
  expectedDeliveryDate?: Date
  notes?: string
  status?: DeliveryStatusValue
}

export class Delivery extends Realm.Object<Delivery> {
  declare _id: string
  declare code: string
  declare deliveryDate: Date
  declare salesOrderId: string
  declare customerId: string
  declare warehouseId: string
  declare shippedByUserId: string | null
  declare trackingNumber: string | null
  declare carrierName: string | null
  declare expectedDeliveryDate: Date | null
  declare status: DeliveryStatusValue
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'Delivery',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      deliveryDate: { type: 'date' },
      salesOrderId: { type: 'string', indexed: true },
      customerId: { type: 'string', indexed: true },
      warehouseId: { type: 'string', indexed: true },
      shippedByUserId: { type: 'string', optional: true },
      trackingNumber: { type: 'string', optional: true },
      carrierName: { type: 'string', optional: true },
      expectedDeliveryDate: { type: 'date', optional: true },
      status: { type: 'string', default: DeliveryStatus.Draft },
      notes: { type: 'string', optional: true },
    },
  }
}

export type DeliveryEntity = Delivery & SoftDeletableEntityFields
