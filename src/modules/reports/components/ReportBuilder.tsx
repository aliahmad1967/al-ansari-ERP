import { useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshCw } from 'lucide-react'
import { DataTable, type DataTableSorting } from '@/components/data-display/DataTable'
import StatCard from '@/components/data-display/StatCard'
import Button from '@/components/ui/Button'
import PageLayout from '@/components/layout/PageLayout'
import { ReportFilters } from './ReportFilters'
import { ReportExportBar } from './ReportExportBar'
import { ReportChart } from './ReportChart'
import type {
  ReportParameter,
  ReportChartConfig,
  ReportDataPoint,
  ReportSummaryCard,
} from '../types/report.types'
import type { DataTableColumn } from '@/components/data-display/DataTable'

interface ReportBuilderProps {
  title: string
  description?: string
  breadcrumbs?: ReactNode
  parameters?: ReportParameter[]
  columns: DataTableColumn<Record<string, unknown>>[]
  data: ReportDataPoint[]
  charts?: ReportChartConfig[]
  summaryCards?: ReportSummaryCard[]
  loading?: boolean
  error?: string | null
  onRefresh?: () => void
  reportFilename?: string
  extraActions?: ReactNode
  onBeforeExport?: () => void
}

function getDefaultFilters(parameters: ReportParameter[]): Record<string, string | number | boolean> {
  const defaults: Record<string, string | number | boolean> = {}
  for (const param of parameters) {
    if (param.defaultValue !== undefined) {
      defaults[param.key] = param.defaultValue
    }
  }
  return defaults
}

export function ReportBuilder({
  title,
  description,
  breadcrumbs,
  parameters = [],
  columns,
  data,
  charts,
  summaryCards,
  loading = false,
  error = null,
  onRefresh,
  reportFilename,
  extraActions,
}: ReportBuilderProps) {
  const { t } = useTranslation('reports')
  const [filterValues, setFilterValues] = useState<Record<string, string | number | boolean>>(
    () => getDefaultFilters(parameters),
  )
  const [sorting, setSorting] = useState<DataTableSorting | null>(null)

  const filteredData = useMemo(() => {
    let result = [...data]

    for (const param of parameters) {
      const val = filterValues[param.key]
      if (val === undefined || val === '' || val === null) continue

      result = result.filter((row) => {
        const cellValue = row[param.key]
        if (cellValue === null || cellValue === undefined) return false
        if (param.type === 'dateRange') {
          const [start, end] = String(val).split(',')
          const cellDate = String(cellValue)
          if (start && cellDate < start) return false
          if (end && cellDate > end) return false
          return true
        }
        if (param.type === 'number') {
          return Number(cellValue) >= Number(val)
        }
        return String(cellValue).toLowerCase().includes(String(val).toLowerCase())
      })
    }

    return result
  }, [data, filterValues, parameters])

  const handleFilterChange = (key: string, value: string | number | boolean) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleResetFilters = () => {
    setFilterValues(getDefaultFilters(parameters))
  }

  const exportColumns = columns.map((c) => ({ key: c.key, header: String(c.header) }))
  const filename = reportFilename ?? title

  return (
    <PageLayout
      title={title}
      description={description}
      breadcrumbs={breadcrumbs ?? <span className="text-sm text-content-muted">{title}</span>}
      actions={
        <div className="flex items-center gap-2">
          {extraActions}
          {onRefresh && (
            <Button variant="ghost" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              <span className="ms-1">{t('actions.refresh')}</span>
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {error && (
          <div className="rounded-lg border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
            {error}
          </div>
        )}

        {summaryCards && summaryCards.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {summaryCards.map((card) => (
              <StatCard
                key={card.id}
                label={t(card.labelKey)}
                value={String(card.value)}
                icon={<card.icon className="h-5 w-5" aria-hidden="true" />}
                tone={card.tone}
              />
            ))}
          </div>
        )}

        {parameters.length > 0 && (
          <ReportFilters
            parameters={parameters}
            values={filterValues}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-content-muted">
            {t('results.count', { count: filteredData.length })}
          </p>
          <ReportExportBar
            data={filteredData}
            columns={exportColumns}
            filename={filename}
            title={title}
          />
        </div>

        {charts && charts.length > 0 && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {charts.map((chart) => (
              <ReportChart key={chart.labelKey} config={chart} data={filteredData} loading={loading} />
            ))}
          </div>
        )}

        <DataTable
          columns={columns}
          data={filteredData as Record<string, unknown>[]}
          rowKey={(row) => String(row._id ?? row.id ?? Math.random())}
          loading={loading}
          sorting={sorting}
          onSortingChange={setSorting}
          dense
          striped
        />
      </div>
    </PageLayout>
  )
}

export default ReportBuilder
