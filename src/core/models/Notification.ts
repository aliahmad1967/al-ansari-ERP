/**
 * Notification — a user-facing message targeting a specific user.
 */

import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const NotificationType = {
  Info: 'info',
  Success: 'success',
  Warning: 'warning',
  Error: 'error',
  Approval: 'approval',
  Task: 'task',
} as const

export type NotificationTypeValue = (typeof NotificationType)[keyof typeof NotificationType]

export interface NotificationInput {
  userId: string
  title: string
  titleAr?: string
  body: string
  bodyAr?: string
  type?: NotificationTypeValue
  isRead?: boolean
  readAt?: Date
  entityType?: string
  entityId?: string
}

export class Notification extends Realm.Object<Notification> {
  declare _id: string
  declare userId: string
  declare title: string
  declare titleAr: string | null
  declare body: string
  declare bodyAr: string | null
  declare type: NotificationTypeValue
  declare isRead: boolean
  declare readAt: Date | null
  declare entityType: string | null
  declare entityId: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'Notification',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      userId: { type: 'string', indexed: true },
      title: 'string',
      titleAr: { type: 'string', optional: true },
      body: 'string',
      bodyAr: { type: 'string', optional: true },
      type: { type: 'string', default: NotificationType.Info },
      isRead: { type: 'bool', default: false },
      readAt: { type: 'date', optional: true },
      entityType: { type: 'string', optional: true },
      entityId: { type: 'string', optional: true },
    },
  }
}

/** Entity shape used by repositories (persisted + soft-delete fields). */
export type NotificationEntity = Notification & SoftDeletableEntityFields
