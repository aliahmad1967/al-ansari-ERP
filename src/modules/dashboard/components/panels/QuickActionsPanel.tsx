import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Inbox, ChevronLeft, ChevronRight } from 'lucide-react'
import type { QuickAction } from '../../types/dashboard.types'

interface QuickActionsPanelProps {
  actions: QuickAction[]
  loading?: boolean
}

export function QuickActionsPanel({ actions, loading }: QuickActionsPanelProps) {
  const { t } = useTranslation('dashboard')
  const navigate = useNavigate()
  const { session } = useAuth()

  const visibleActions = actions.filter((action) => {
    if (!action.permission) return true
    return session?.permissionCodes.includes(action.permission) ?? false
  })

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>{t('panels.quickActions.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-sunken" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t('panels.quickActions.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {visibleActions.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-6 w-6" />}
            title={t('panels.quickActions.empty')}
            className="py-6"
          />
        ) : (
          <div className="space-y-2">
            {visibleActions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.id}
                  onClick={() => navigate(action.route)}
                  className="flex w-full items-center justify-between rounded-lg border border-border p-3 text-left transition-colors hover:bg-surface-sunken/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium text-content">
                      {t(action.labelKey)}
                    </span>
                  </div>
                  {document.documentElement.dir === 'rtl' ? (
                    <ChevronLeft className="h-4 w-4 text-content-subtle" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-content-subtle" />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default QuickActionsPanel
