import { useTranslation } from 'react-i18next'
import PageLayout from '@/components/layout/PageLayout'
import { useReport } from '../hooks/useReport'
import { ReportChart } from '../components/ReportChart'

export default function Analytics() {
  const { t } = useTranslation('reports')

  const hrData = useReport('hr-employee-summary')
  const inventoryData = useReport('inventory-stock-summary')
  const salesData = useReport('sales-revenue')
  const procurementData = useReport('procurement-orders-summary')
  const projectsData = useReport('projects-summary')

  return (
    <PageLayout
      title={t('analytics.title')}
      description={t('analytics.description')}
      breadcrumbs={<span className="text-sm text-content-muted">{t('analytics.title')}</span>}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ReportChart
            config={{ type: 'pie', dataKey: 'count', nameKey: 'category', labelKey: 'charts.employeeDistribution' }}
            data={hrData.data}
            loading={hrData.loading}
          />
          <ReportChart
            config={{ type: 'bar', dataKey: 'count', nameKey: 'category', labelKey: 'charts.orderStatus' }}
            data={procurementData.data}
            loading={procurementData.loading}
          />
          <ReportChart
            config={{ type: 'pie', dataKey: 'value', nameKey: 'category', labelKey: 'charts.revenueBreakdown' }}
            data={salesData.data}
            loading={salesData.loading}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ReportChart
            config={{ type: 'bar', dataKey: 'quantity', nameKey: 'product', labelKey: 'charts.stockLevels' }}
            data={inventoryData.data}
            loading={inventoryData.loading}
          />
          <ReportChart
            config={{ type: 'pie', dataKey: 'count', nameKey: 'category', labelKey: 'charts.projectStatus' }}
            data={projectsData.data}
            loading={projectsData.loading}
          />
        </div>
      </div>
    </PageLayout>
  )
}
