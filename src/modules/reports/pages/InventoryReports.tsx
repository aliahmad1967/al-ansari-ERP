import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Package, ArrowUpDown, DollarSign } from 'lucide-react'
import { cn } from '@/lib/cn'
import { ReportBuilder } from '../components/ReportBuilder'
import { useReport } from '../hooks/useReport'
import type { DataTableColumn } from '@/components/data-display/DataTable'
import type { ReportParameter } from '../types/report.types'

const TABS = ['stock', 'movements', 'valuation'] as const
type Tab = (typeof TABS)[number]

const TAB_ICONS: Record<Tab, typeof Package> = {
  stock: Package,
  movements: ArrowUpDown,
  valuation: DollarSign,
}

const TAB_KEYS: Record<Tab, string> = {
  stock: 'inventory-stock-summary',
  movements: 'inventory-movements-summary',
  valuation: 'inventory-valuation',
}

export default function InventoryReports() {
  const { t } = useTranslation('reports')
  const { t: tInv } = useTranslation('inventory')
  const [activeTab, setActiveTab] = useState<Tab>('stock')

  const { data, loading, error, refresh } = useReport(TAB_KEYS[activeTab])

  const filters: ReportParameter[] = [
    {
      key: 'product',
      labelKey: 'filters.product',
      type: 'text',
      placeholder: 'filters.searchProduct',
    },
    {
      key: 'warehouse',
      labelKey: 'filters.warehouse',
      type: 'select',
      options: [],
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
    stock: [
      { key: 'product', header: t('columns.product'), sortable: true },
      { key: 'warehouse', header: t('columns.warehouse'), sortable: true },
      { key: 'quantity', header: t('columns.quantity'), sortable: true, align: 'end' },
      { key: 'unitCost', header: t('columns.unitCost'), sortable: true, align: 'end',
        render: (row) => `SAR ${Number(row.unitCost || 0).toLocaleString()}`,
      },
      { key: 'totalValue', header: t('columns.totalValue'), sortable: true, align: 'end',
        render: (row) => `SAR ${Number(row.totalValue || 0).toLocaleString()}`,
      },
    ],
    movements: [
      { key: 'category', header: t('columns.movementType'), sortable: true },
      { key: 'count', header: t('columns.count'), sortable: true, align: 'end' },
    ],
    valuation: [
      { key: 'category', header: t('columns.category'), sortable: true },
      { key: 'quantity', header: t('columns.quantity'), sortable: true, align: 'end' },
      { key: 'unitCost', header: t('columns.unitCost'), sortable: true, align: 'end',
        render: (row) => row.unitCost ? `SAR ${Number(row.unitCost).toLocaleString()}` : '-',
      },
      { key: 'totalValue', header: t('columns.totalValue'), sortable: true, align: 'end',
        render: (row) => row.totalValue ? `SAR ${Number(row.totalValue).toLocaleString()}` : '-',
      },
    ],
  }

  const chartConfigs = {
    stock: [
      { type: 'bar' as const, dataKey: 'quantity', nameKey: 'product', labelKey: 'charts.stockLevels' },
    ],
    movements: [
      { type: 'pie' as const, dataKey: 'count', nameKey: 'category', labelKey: 'charts.movementDistribution' },
    ],
    valuation: [
      { type: 'bar' as const, dataKey: 'totalValue', nameKey: 'category', labelKey: 'charts.inventoryValuation' },
    ],
  }

  const totalValue = data.reduce((sum, row) => sum + Number(row.totalValue || 0), 0)

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
              {tInv(`reports.${tab}`)}
            </button>
          )
        })}
      </div>

      <ReportBuilder
        title={tInv(`reports.${activeTab}`)}
        description={t('inventory.description', { tab: tInv(`reports.${activeTab}`) })}
        breadcrumbs={
          <span className="text-sm text-content-muted">
            {tInv('title')} / {tInv(`reports.${activeTab}`)}
          </span>
        }
        parameters={filters}
        columns={columns[activeTab]}
        data={data}
        charts={chartConfigs[activeTab]}
        summaryCards={[
          {
            id: 'totalValue',
            labelKey: 'inventory.summary.totalValue',
            value: totalValue,
            tone: 'info',
            icon: DollarSign,
          },
        ]}
        loading={loading}
        error={error}
        onRefresh={refresh}
        reportFilename={`inventory-${activeTab}-report`}
      />
    </div>
  )
}
