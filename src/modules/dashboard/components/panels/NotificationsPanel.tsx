import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Inbox, Bell } from 'lucide-react'
import type { NotificationItem } from '../../types/dashboard.types'

interface NotificationsPanelProps {
  items: NotificationItem[]
  loading?: boolean
}

export function NotificationsPanel({ items, loading }: NotificationsPanelProps) {
  const { t } = useTranslation('dashboard')

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>{t('panels.notifications.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-sunken" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t('panels.notifications.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-6 w-6" />}
            title={t('panels.notifications.empty')}
            className="py-6"
          />
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-surface-sunken/50 ${
                  !item.read ? 'bg-primary-subtle/30' : ''
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    !item.read ? 'bg-primary-subtle text-primary' : 'bg-surface-sunken text-content-muted'
                  }`}
                >
                  <Bell className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${!item.read ? 'text-content' : 'text-content-muted'}`}>
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs text-content-muted">{item.message}</p>
                </div>
                {!item.read && (
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default NotificationsPanel
