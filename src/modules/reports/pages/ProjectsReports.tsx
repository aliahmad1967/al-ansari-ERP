import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FolderKanban, CheckSquare } from 'lucide-react'
import { cn } from '@/lib/cn'
import { ReportBuilder } from '../components/ReportBuilder'
import { useReport } from '../hooks/useReport'
import type { DataTableColumn } from '@/components/data-display/DataTable'
import type { ReportParameter } from '../types/report.types'

const TABS = ['projects', 'tasks'] as const
type Tab = (typeof TABS)[number]

const TAB_ICONS: Record<Tab, typeof FolderKanban> = {
  projects: FolderKanban,
  tasks: CheckSquare,
}

const TAB_KEYS: Record<Tab, string> = {
  projects: 'projects-summary',
  tasks: 'projects-tasks-summary',
}

export default function ProjectsReports() {
  const { t } = useTranslation('reports')
  const { t: tProj } = useTranslation('projects')
  const [activeTab, setActiveTab] = useState<Tab>('projects')

  const { data, loading, error, refresh } = useReport(TAB_KEYS[activeTab])

  const filters: ReportParameter[] = [
    {
      key: 'status',
      labelKey: 'filters.status',
      type: 'select',
      options: [
        { label: 'Planning', value: 'planning' },
        { label: 'Active', value: 'active' },
        { label: 'On Hold', value: 'on_hold' },
        { label: 'Completed', value: 'completed' },
      ],
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
    projects: [
      { key: 'category', header: t('columns.status'), sortable: true },
      { key: 'count', header: t('columns.count'), sortable: true, align: 'end' },
    ],
    tasks: [
      { key: 'category', header: t('columns.status'), sortable: true },
      { key: 'count', header: t('columns.count'), sortable: true, align: 'end' },
    ],
  }

  const chartConfigs = {
    projects: [
      { type: 'pie' as const, dataKey: 'count', nameKey: 'category', labelKey: 'charts.projectStatus' },
    ],
    tasks: [
      { type: 'bar' as const, dataKey: 'count', nameKey: 'category', labelKey: 'charts.taskDistribution' },
    ],
  }

  const totalCount = data.reduce((sum, row) => sum + Number(row.count || 0), 0)

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
              {tProj(`reports.${tab}`)}
            </button>
          )
        })}
      </div>

      <ReportBuilder
        title={tProj(`reports.${activeTab}`)}
        description={t('projects.description', { tab: tProj(`reports.${activeTab}`) })}
        breadcrumbs={
          <span className="text-sm text-content-muted">
            {tProj('title')} / {tProj(`reports.${activeTab}`)}
          </span>
        }
        parameters={filters}
        columns={columns[activeTab]}
        data={data}
        charts={chartConfigs[activeTab]}
        summaryCards={[
          {
            id: 'total',
            labelKey: 'projects.summary.total',
            value: totalCount,
            tone: 'primary',
            icon: FolderKanban,
          },
        ]}
        loading={loading}
        error={error}
        onRefresh={refresh}
        reportFilename={`projects-${activeTab}-report`}
      />
    </div>
  )
}
