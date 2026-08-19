import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Package, FolderTree } from 'lucide-react'
import { cn } from '@/lib/cn'
import { ReportBuilder } from '../components/ReportBuilder'
import { useReport } from '../hooks/useReport'
import type { DataTableColumn } from '@/components/data-display/DataTable'
import type { ReportParameter } from '../types/report.types'

const TABS = ['status', 'category'] as const
type Tab = (typeof TABS)[number]

const TAB_ICONS: Record<Tab, typeof Package> = {
  status: Package,
  category: FolderTree,
}

const TAB_KEYS: Record<Tab, string> = {
  status: 'assets-summary',
  category: 'assets-by-category',
}

export default function AssetsReports() {
  const { t } = useTranslation('reports')
  const { t: tAssets } = useTranslation('assets')
  const [activeTab, setActiveTab] = useState<Tab>('status')

  const { data, loading, error, refresh } = useReport(TAB_KEYS[activeTab])

  const filters: ReportParameter[] = [
    {
      key: 'status',
      labelKey: 'filters.status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Disposed', value: 'disposed' },
      ],
    },
    {
      key: 'category',
      labelKey: 'filters.category',
      type: 'text',
      placeholder: 'filters.searchCategory',
    },
    {
      key: 'dateFrom',
      labelKey: 'filters.dateFrom',
      type: 'date',
    },
    {
      key: 'dateTo',
      labelKey: 'filters.dateTo',
      type: 'date',
    },
  ]

  const columns: Record<Tab, DataTableColumn<Record<string, unknown>>[]> = {
    status: [
      { key: 'category', header: t('columns.status'), sortable: true },
      { key: 'count', header: t('columns.count'), sortable: true, align: 'end' },
    ],
    category: [
      { key: 'category', header: t('columns.category'), sortable: true },
      { key: 'value', header: t('columns.totalValue'), sortable: true, align: 'end',
        render: (row) => `SAR ${Number(row.value || 0).toLocaleString()}`,
      },
    ],
  }

  const chartConfigs = {
    status: [
      { type: 'pie' as const, dataKey: 'count', nameKey: 'category', labelKey: 'charts.assetStatus' },
    ],
    category: [
      { type: 'bar' as const, dataKey: 'value', nameKey: 'category', labelKey: 'charts.assetsByCategory' },
    ],
  }

  const totalValue = data.reduce((sum, row) => sum + Number(row.value || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const Icon = TAB_ICONS[tab]
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                activeTab === tab
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-surface text-content-muted hover:bg-surface-raised',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {tAssets(`reports.${tab}`)}
            </button>
          )
        })}
      </div>

      <ReportBuilder
        title={tAssets(`reports.${activeTab}`)}
        description={t('assets.description', { tab: tAssets(`reports.${activeTab}`) })}
        breadcrumbs={
          <span className="text-sm text-content-muted">
            {tAssets('title')} / {tAssets(`reports.${activeTab}`)}
          </span>
        }
        parameters={filters}
        columns={columns[activeTab]}
        data={data}
        charts={chartConfigs[activeTab]}
        summaryCards={[
          {
            id: 'totalValue',
            labelKey: 'assets.summary.totalValue',
            value: totalValue,
            tone: 'info',
            icon: Package,
          },
        ]}
        loading={loading}
        error={error}
        onRefresh={refresh}
        reportFilename={`assets-${activeTab}-report`}
      />
    </div>
  )
}
