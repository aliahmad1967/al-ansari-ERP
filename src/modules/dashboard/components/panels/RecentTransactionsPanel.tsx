import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Inbox, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import type { TransactionItem } from '../../types/dashboard.types'

interface RecentTransactionsPanelProps {
  items: TransactionItem[]
  loading?: boolean
}

export function RecentTransactionsPanel({ items, loading }: RecentTransactionsPanelProps) {
  const { t } = useTranslation('dashboard')

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>{t('panels.recentTransactions.title')}</CardTitle>
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
        <CardTitle>{t('panels.recentTransactions.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-6 w-6" />}
            title={t('panels.recentTransactions.empty')}
            className="py-6"
          />
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const isPositive = item.amount >= 0
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-surface-sunken/50"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        isPositive ? 'bg-success-subtle text-success-muted' : 'bg-danger-subtle text-danger-muted'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 rtl:-scale-x-100" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-content">{item.description}</p>
                      <p className="text-xs text-content-muted">{item.type}</p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 text-sm font-semibold ${
                      isPositive ? 'text-success-muted' : 'text-danger-muted'
                    }`}
                  >
                    {isPositive ? '+' : ''}{formatCurrency(Math.abs(item.amount))}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentTransactionsPanel
