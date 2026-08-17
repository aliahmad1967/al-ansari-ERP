import { useTranslation } from 'react-i18next'
import { ActivityFeed, ActivityItem } from '@/components/data-display/ActivityFeed'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Inbox, Plus, Check, Pencil, Trash2, Download } from 'lucide-react'
import type { ActivityLogItem } from '../../types/dashboard.types'

interface RecentActivityPanelProps {
  items: ActivityLogItem[]
  loading?: boolean
}

const actionIcons: Record<string, typeof Plus> = {
  Created: Plus,
  Approved: Check,
  Updated: Pencil,
  Deleted: Trash2,
  Exported: Download,
}

export function RecentActivityPanel({ items, loading }: RecentActivityPanelProps) {
  const { t } = useTranslation('dashboard')

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>{t('panels.recentActivity.title')}</CardTitle>
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
        <CardTitle>{t('panels.recentActivity.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-6 w-6" />}
            title={t('panels.recentActivity.empty')}
            className="py-6"
          />
        ) : (
          <ActivityFeed>
            {items.map((item) => {
              const Icon = actionIcons[item.action] ?? Plus
              return (
                <ActivityItem
                  key={item.id}
                  title={item.action}
                  description={`${item.entity} — ${item.user}`}
                  icon={<Icon className="h-4 w-4" />}
                  tone={item.tone}
                />
              )
            })}
          </ActivityFeed>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentActivityPanel
