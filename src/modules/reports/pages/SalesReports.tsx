import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FileCheck, DollarSign } from 'lucide-react'
import { cn } from '@/lib/cn'
import { ReportBuilder } from '../components/ReportBuilder'
import { useReport } from '../hooks/useReport'
import type { DataTableColumn } from '@/components/data-display/DataTable'
import type { ReportParameter } from '../types/report.types'

const TABS = ['invoices', 'revenue'] as const
type Tab = (typeof TABS)[number]

const TAB_ICONS: Record<Tab, typeof FileCheck> = {
  invoices: FileCheck,
  revenue: DollarSign,
}

const TAB_KEYS: Record<Tab, string> = {
  invoices: 'sales-summary',
  revenue: 'sales-revenue',
}

export default function SalesReports() {
  const { t } = useTranslation('reports')
  const { t: tSales } = useTranslation('sales')
  const [activeTab, setActiveTab] = useState<Tab>('invoices')

  const { data, loading, error, refresh } = useReport(TAB_KEYS[activeTab])

  const filters: ReportParameter[] = [
    {
      key: 'status',
      labelKey: 'filters.status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Sent', value: 'sent' },
        { label: 'Paid', value: 'paid' },
        { label: 'Overdue', value: 'overdue' },
      ],
    },
    {
      key: 'customer',
      labelKey: 'filters.customer',
      type: 'text',
      placeholder: 'filters.searchCustomer',
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
    invoices: [
      { key: 'category', header: t('columns.status'), sortable: true },
      { key: 'count', header: t('columns.count'), sortable: true, align: 'end' },
    ],
    revenue: [
      { key: 'category', header: t('columns.category'), sortable: true },
      { key: 'value', header: t('columns.amount'), sortable: true, align: 'end',
        render: (row) => `SAR ${Number(row.value || 0).toLocaleString()}`,
      },
    ],
  }

  const chartConfigs = {
    invoices: [
      { type: 'pie' as const, dataKey: 'count', nameKey: 'category', labelKey: 'charts.invoiceStatus' },
    ],
    revenue: [
      { type: 'bar' as const, dataKey: 'value', nameKey: 'category', labelKey: 'charts.revenueBreakdown' },
    ],
  }

  const totalRevenue = data.reduce((sum, row) => sum + Number(row.value || 0), 0)

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
              {tSales(`reports.${tab}`)}
            </button>
          )
        })}
      </div>

      <ReportBuilder
        title={tSales(`reports.${activeTab}`)}
        description={t('sales.description', { tab: tSales(`reports.${activeTab}`) })}
        breadcrumbs={
          <span className="text-sm text-content-muted">
            {tSales('title')} / {tSales(`reports.${activeTab}`)}
          </span>
        }
        parameters={filters}
        columns={columns[activeTab]}
        data={data}
        charts={chartConfigs[activeTab]}
        summaryCards={[
          {
            id: 'totalRevenue',
            labelKey: 'sales.summary.totalRevenue',
            value: totalRevenue,
            tone: 'success',
            icon: DollarSign,
          },
        ]}
        loading={loading}
        error={error}
        onRefresh={refresh}
        reportFilename={`sales-${activeTab}-report`}
      />
    </div>
  )
}
