/**
 * NotificationService — business-layer facade for user notifications.
 *
 * Responsibilities:
 *  - Creating notifications for users
 *  - Querying notifications by user
 *  - Marking notifications as read
 *  - Counting unread notifications
 *  - Batch operations (mark all read)
 */

import { NotificationType, type NotificationInput, type NotificationTypeValue } from '../models/Notification'
import { NotificationRepository } from '../repositories/NotificationRepository'
import type { FindOptions } from '../repositories/BaseRepository'

export interface NotificationSummary {
  id: string
  title: string
  titleAr: string | null
  body: string
  bodyAr: string | null
  type: NotificationTypeValue
  isRead: boolean
  readAt: Date | null
  entityType: string | null
  entityId: string | null
  createdAt: Date
}

export class NotificationService {
  private readonly repository = new NotificationRepository()

  create(input: NotificationInput): NotificationSummary {
    const notification = this.repository.create(input)
    return this.toSummary(notification)
  }

  findByUser(userId: string, options?: FindOptions): NotificationSummary[] {
    return this.repository.findByUser(userId, options).map(this.toSummary)
  }

  findUnread(userId: string, options?: FindOptions): NotificationSummary[] {
    return this.repository.findUnread(userId, options).map(this.toSummary)
  }

  countUnread(userId: string): number {
    return this.repository.countUnread(userId)
  }

  markRead(id: string): NotificationSummary | null {
    const updated = this.repository.markRead(id)
    return updated ? this.toSummary(updated) : null
  }

  markAllRead(userId: string): number {
    return this.repository.markAllRead(userId)
  }

  findById(id: string): NotificationSummary | null {
    const notification = this.repository.findById(id)
    return notification ? this.toSummary(notification) : null
  }

  softDelete(id: string): boolean {
    return this.repository.softDelete(id)
  }

  // ── Convenience methods ─────────────────────────────────────────

  createInfo(userId: string, title: string, body: string, entityType?: string, entityId?: string): NotificationSummary {
    return this.create({ userId, title, body, type: NotificationType.Info, entityType, entityId })
  }

  createSuccess(userId: string, title: string, body: string, entityType?: string, entityId?: string): NotificationSummary {
    return this.create({ userId, title, body, type: NotificationType.Success, entityType, entityId })
  }

  createWarning(userId: string, title: string, body: string, entityType?: string, entityId?: string): NotificationSummary {
    return this.create({ userId, title, body, type: NotificationType.Warning, entityType, entityId })
  }

  createError(userId: string, title: string, body: string, entityType?: string, entityId?: string): NotificationSummary {
    return this.create({ userId, title, body, type: NotificationType.Error, entityType, entityId })
  }

  createApproval(userId: string, title: string, body: string, entityType?: string, entityId?: string): NotificationSummary {
    return this.create({ userId, title, body, type: NotificationType.Approval, entityType, entityId })
  }

  private toSummary(notification: import('../models/Notification').NotificationEntity): NotificationSummary {
    return {
      id: notification._id,
      title: notification.title,
      titleAr: notification.titleAr,
      body: notification.body,
      bodyAr: notification.bodyAr,
      type: notification.type,
      isRead: notification.isRead,
      readAt: notification.readAt,
      entityType: notification.entityType,
      entityId: notification.entityId,
      createdAt: notification.createdAt,
    }
  }
}
