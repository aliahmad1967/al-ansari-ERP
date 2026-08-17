/**
 * NotificationRepository — persistence for user-facing {@link Notification}s.
 */

import { Notification, type NotificationInput } from '../models/Notification'
import { maxLength, required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class NotificationRepository extends BaseRepository<Notification, NotificationInput> {
  protected get objectType(): string {
    return 'Notification'
  }

  protected get modelClass(): ModelConstructor<Notification> {
    return Notification
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      userId: required('User id'),
      title: required('Title'),
      body: required('Body'),
      titleAr: maxLength('Arabic title', 256),
      bodyAr: maxLength('Arabic body', 1024),
    })
  }

  protected validateUpdate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      title: values['title'] !== undefined ? required('Title') : undefined,
      body: values['body'] !== undefined ? required('Body') : undefined,
    })
  }

  findByUser(userId: string, options: FindOptions = {}): Notification[] {
    return this.query('userId == $0', [userId], {
      ...options,
      sortBy: 'createdAt',
      sortAscending: false,
    })
  }

  findUnread(userId: string, options: FindOptions = {}): Notification[] {
    return this.query('userId == $0 AND isRead == false', [userId], {
      ...options,
      sortBy: 'createdAt',
      sortAscending: false,
    })
  }

  countUnread(userId: string): number {
    return this.countQuery('userId == $0 AND isRead == false', [userId])
  }

  /** Marks a single notification as read. Returns the updated record. */
  markRead(id: string): Notification | null {
    const existing = this.findById(id)
    if (!existing) return null
    if (existing.isRead) return existing
    return this.update(id, { isRead: true, readAt: new Date() })
  }

  /** Marks every unread notification of a user as read. Returns the count updated. */
  markAllRead(userId: string): number {
    const unread = this.findUnread(userId)
    let updated = 0
    for (const notification of unread) {
      this.update(notification._id, { isRead: true, readAt: new Date() })
      updated += 1
    }
    return updated
  }
}
