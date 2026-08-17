import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Inbox } from 'lucide-react'
import type { ApprovalItem } from '../../types/dashboard.types'

interface PendingApprovalsPanelProps {
  items: ApprovalItem[]
  loading?: boolean
}

export function PendingApprovalsPanel({ items, loading }: PendingApprovalsPanelProps) {
  const { t } = useTranslation('dashboard')

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>{t('panels.pendingApprovals.title')}</CardTitle>
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
        <CardTitle>{t('panels.pendingApprovals.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-6 w-6" />}
            title={t('panels.pendingApprovals.empty')}
            className="py-6"
          />
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-surface-sunken/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-content">{item.title}</p>
                  <p className="text-xs text-content-muted">{item.requestedBy}</p>
                </div>
                <Badge variant="warning" className="shrink-0">{item.type}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PendingApprovalsPanel
