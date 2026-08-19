import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, Building2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { ReportBuilder } from '../components/ReportBuilder'
import { useReport } from '../hooks/useReport'
import type { DataTableColumn } from '@/components/data-display/DataTable'
import type { ReportParameter } from '../types/report.types'

const TABS = ['orders', 'bySupplier'] as const
type Tab = (typeof TABS)[number]

const TAB_ICONS: Record<Tab, typeof ShoppingCart> = {
  orders: ShoppingCart,
  bySupplier: Building2,
}

const TAB_KEYS: Record<Tab, string> = {
  orders: 'procurement-orders-summary',
  bySupplier: 'procurement-by-supplier',
}

export default function ProcurementReports() {
  const { t } = useTranslation('reports')
  const { t: tProc } = useTranslation('procurement')
  const [activeTab, setActiveTab] = useState<Tab>('orders')

  const { data, loading, error, refresh } = useReport(TAB_KEYS[activeTab])

  const filters: ReportParameter[] = [
    {
      key: 'status',
      labelKey: 'filters.status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Approved', value: 'approved' },
        { label: 'Sent', value: 'sent' },
        { label: 'Received', value: 'received' },
      ],
    },
    {
      key: 'supplier',
      labelKey: 'filters.supplier',
      type: 'text',
      placeholder: 'filters.searchSupplier',
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
    orders: [
      { key: 'category', header: t('columns.status'), sortable: true },
      { key: 'count', header: t('columns.count'), sortable: true, align: 'end' },
    ],
    bySupplier: [
      { key: 'category', header: t('columns.supplier'), sortable: true },
      { key: 'value', header: t('columns.totalAmount'), sortable: true, align: 'end',
        render: (row) => `SAR ${Number(row.value || 0).toLocaleString()}`,
      },
    ],
  }

  const chartConfigs = {
    orders: [
      { type: 'pie' as const, dataKey: 'count', nameKey: 'category', labelKey: 'charts.orderStatus' },
    ],
    bySupplier: [
      { type: 'bar' as const, dataKey: 'value', nameKey: 'category', labelKey: 'charts.spendingBySupplier' },
    ],
  }

  const totalAmount = data.reduce((sum, row) => sum + Number(row.value || 0), 0)

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
              {tProc(`reports.${tab}`)}
            </button>
          )
        })}
      </div>

      <ReportBuilder
        title={tProc(`reports.${activeTab}`)}
        description={t('procurement.description', { tab: tProc(`reports.${activeTab}`) })}
        breadcrumbs={
          <span className="text-sm text-content-muted">
            {tProc('title')} / {tProc(`reports.${activeTab}`)}
          </span>
        }
        parameters={filters}
        columns={columns[activeTab]}
        data={data}
        charts={chartConfigs[activeTab]}
        summaryCards={[
          {
            id: 'total',
            labelKey: 'procurement.summary.totalAmount',
            value: totalAmount,
            tone: 'warning',
            icon: ShoppingCart,
          },
        ]}
        loading={loading}
        error={error}
        onRefresh={refresh}
        reportFilename={`procurement-${activeTab}-report`}
      />
    </div>
  )
}
