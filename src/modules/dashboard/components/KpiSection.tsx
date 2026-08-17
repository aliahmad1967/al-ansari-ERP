import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { StatCard } from '@/components/data-display/StatCard'
import type { KpiData } from '../types/dashboard.types'

interface KpiSectionProps {
  kpis: KpiData[]
  loading?: boolean
}

export function KpiSection({ kpis, loading }: KpiSectionProps) {
  const { t } = useTranslation('dashboard')
  const { session } = useAuth()

  const visibleKpis = kpis.filter((kpi) => {
    if (!kpi.permission) return true
    return session?.permissionCodes.includes(kpi.permission) ?? false
  })

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-lg bg-surface-sunken" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {visibleKpis.map((kpi) => (
        <StatCard
          key={kpi.id}
          label={t(kpi.labelKey)}
          value={kpi.value}
          icon={<kpi.icon className="h-5 w-5" />}
          tone={kpi.tone}
          trend={kpi.trend}
          trendLabel={kpi.trendLabelKey ? t(kpi.trendLabelKey) : undefined}
          loading={loading}
          className={kpi.isDemo ? 'border-dashed border-warning/50' : ''}
        />
      ))}
    </div>
  )
}

export default KpiSection
