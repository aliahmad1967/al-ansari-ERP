import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/format'

interface DashboardHeaderProps {
  onRefresh: () => void
  isRefreshing?: boolean
}

export function DashboardHeader({ onRefresh, isRefreshing }: DashboardHeaderProps) {
  const { t } = useTranslation('dashboard')
  const { session } = useAuth()

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-content">
          {t('header.welcome', { name: session?.user?.fullName ?? '' })}
        </h1>
        <p className="mt-1 text-sm text-content-muted">
          {t('header.subtitle')} — {formatDate(new Date(), { dateStyle: 'long' })}
        </p>
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        <span className="ms-2 hidden sm:inline">{t('header.refresh')}</span>
      </Button>
    </div>
  )
}

export default DashboardHeader
