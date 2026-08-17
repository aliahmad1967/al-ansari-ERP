import { useTranslation } from 'react-i18next'
import { Alert } from '@/components/ui/Alert'
import PageLayout from '@/components/layout/PageLayout'
import { useDashboardData } from '../hooks/useDashboardData'
import { DashboardHeader } from '../components/DashboardHeader'
import { KpiSection } from '../components/KpiSection'
import { ChartsSection } from '../components/ChartsSection'
import { PanelsSection } from '../components/PanelsSection'

export default function Dashboard() {
  const { t } = useTranslation('dashboard')
  const { data, isLoading, error, refresh } = useDashboardData()

  return (
    <PageLayout
      title={t('title')}
      description={t('subtitle')}
      breadcrumbs={<span className="text-sm text-content-muted">{t('title')}</span>}
    >
      {error && (
        <Alert tone="danger" title={t('error.title')} className="mb-4">
          {error}
        </Alert>
      )}

      <div className="space-y-6">
        <DashboardHeader onRefresh={refresh} isRefreshing={isLoading} />

        <KpiSection kpis={data?.kpis ?? []} loading={isLoading} />

        <ChartsSection
          revenueVsExpenses={data?.revenueVsExpenses ?? []}
          salesTrend={data?.salesTrend ?? []}
          expenseTrend={data?.expenseTrend ?? []}
          inventoryDistribution={data?.inventoryDistribution ?? []}
          employeeDistribution={data?.employeeDistribution ?? []}
          loading={isLoading}
        />

        <PanelsSection
          pendingApprovals={data?.pendingApprovals ?? []}
          recentTransactions={data?.recentTransactions ?? []}
          recentActivity={data?.recentActivity ?? []}
          notifications={data?.notifications ?? []}
          quickActions={data?.quickActions ?? []}
          loading={isLoading}
        />
      </div>
    </PageLayout>
  )
}
