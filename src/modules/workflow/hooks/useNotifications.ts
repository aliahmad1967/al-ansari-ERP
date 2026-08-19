/**
 * useNotifications — React hook for user notifications from Realm.
 *
 * Provides notification queries, mark-as-read, and unread count.
 * Integrates with the toast store for real-time in-app notifications.
 */

import { useCallback, useEffect, useState } from 'react'

import { pushToast } from '@/stores/notification.store'

interface NotificationData {
  id: string
  title: string
  titleAr: string | null
  body: string
  bodyAr: string | null
  type: string
  isRead: boolean
  readAt: string | null
  entityType: string | null
  entityId: string | null
  createdAt: string
}

interface NotificationProvider {
  findByUser(userId: string): NotificationData[]
  findUnread(userId: string): NotificationData[]
  countUnread(userId: string): number
  markRead(id: string): NotificationData | null
  markAllRead(userId: string): number
}

let providerPromise: Promise<NotificationProvider> | null = null

function getProvider(): Promise<NotificationProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/core/services/NotificationService')
      const svc = new mod.NotificationService()
      return {
        findByUser: (userId) => svc.findByUser(userId).map((n) => ({
          id: n.id,
          title: n.title,
          titleAr: n.titleAr,
          body: n.body,
          bodyAr: n.bodyAr,
          type: n.type,
          isRead: n.isRead,
          readAt: n.readAt ? n.readAt.toISOString() : null,
          entityType: n.entityType,
          entityId: n.entityId,
          createdAt: n.createdAt.toISOString(),
        })),
        findUnread: (userId) => svc.findUnread(userId).map((n) => ({
          id: n.id,
          title: n.title,
          titleAr: n.titleAr,
          body: n.body,
          bodyAr: n.bodyAr,
          type: n.type,
          isRead: n.isRead,
          readAt: n.readAt ? n.readAt.toISOString() : null,
          entityType: n.entityType,
          entityId: n.entityId,
          createdAt: n.createdAt.toISOString(),
        })),
        countUnread: (userId) => svc.countUnread(userId),
        markRead: (id) => {
          const result = svc.markRead(id)
          return result ? {
            id: result.id,
            title: result.title,
            titleAr: result.titleAr,
            body: result.body,
            bodyAr: result.bodyAr,
            type: result.type,
            isRead: result.isRead,
            readAt: result.readAt ? result.readAt.toISOString() : null,
            entityType: result.entityType,
            entityId: result.entityId,
            createdAt: result.createdAt.toISOString(),
          } : null
        },
        markAllRead: (userId) => svc.markAllRead(userId),
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): NotificationProvider {
  const KEY = 'erp_dev_notifications'
  const load = (): NotificationData[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  }
  const save = (data: NotificationData[]) => localStorage.setItem(KEY, JSON.stringify(data))
  return {
    findByUser: (userId) => load().filter((n) => {
      const parsed = JSON.parse(JSON.stringify(n))
      return parsed.userId === userId
    }),
    findUnread: (userId) => load().filter((n) => {
      const parsed = JSON.parse(JSON.stringify(n))
      return parsed.userId === userId && !parsed.isRead
    }),
    countUnread: (userId) => load().filter((n) => {
      const parsed = JSON.parse(JSON.stringify(n))
      return parsed.userId === userId && !parsed.isRead
    }).length,
    markRead: (id) => {
      const data = load(); const idx = data.findIndex((n) => n.id === id)
      if (idx === -1) return null
      data[idx].isRead = true; data[idx].readAt = new Date().toISOString()
      save(data); return data[idx]
    },
    markAllRead: (userId) => {
      const data = load(); let count = 0
      for (const n of data) {
        const parsed = JSON.parse(JSON.stringify(n))
        if (parsed.userId === userId && !parsed.isRead) {
          n.isRead = true; n.readAt = new Date().toISOString(); count++
        }
      }
      save(data); return count
    },
  }
}

export interface UseNotificationsResult {
  notifications: NotificationData[]
  unreadCount: number
  loading: boolean
  error: string | null
  refresh: () => void
  markRead: (id: string) => void
  markAllRead: () => void
}

export function useNotifications(userId: string): UseNotificationsResult {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => {
        if (active) {
          setNotifications(p.findByUser(userId))
          setUnreadCount(p.countUnread(userId))
          setError(null)
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Unknown error')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [userId, refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  const markRead = useCallback(async (id: string) => {
    const p = await getProvider()
    p.markRead(id)
    pushToast({ tone: 'info', title: 'Notification marked as read' })
    refresh()
  }, [refresh])

  const markAllRead = useCallback(async () => {
    const p = await getProvider()
    const count = p.markAllRead(userId)
    pushToast({ tone: 'info', title: `${count} notifications marked as read` })
    refresh()
  }, [userId, refresh])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markRead,
    markAllRead,
  }
}
