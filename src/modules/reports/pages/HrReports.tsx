import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Users, Clock, CalendarDays, Calculator } from 'lucide-react'
import { cn } from '@/lib/cn'
import { ReportBuilder } from '../components/ReportBuilder'
import { useReport } from '../hooks/useReport'
import type { DataTableColumn } from '@/components/data-display/DataTable'
import type { ReportParameter } from '../types/report.types'

const TABS = ['employees', 'attendance', 'leave', 'payroll'] as const
type Tab = (typeof TABS)[number]

const TAB_ICONS: Record<Tab, typeof Users> = {
  employees: Users,
  attendance: Clock,
  leave: CalendarDays,
  payroll: Calculator,
}

const TAB_KEYS: Record<Tab, string> = {
  employees: 'hr-employee-summary',
  attendance: 'hr-attendance-summary',
  leave: 'hr-leave-summary',
  payroll: 'hr-payroll-summary',
}

export default function HrReports() {
  const { t } = useTranslation('reports')
  const { t: tHr } = useTranslation('hr')
  const [activeTab, setActiveTab] = useState<Tab>('employees')

  const { data, loading, error, refresh } = useReport(TAB_KEYS[activeTab])

  const filters: ReportParameter[] = [
    {
      key: 'category',
      labelKey: 'filters.status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Terminated', value: 'terminated' },
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
    employees: [
      { key: 'category', header: t('columns.department'), sortable: true },
      { key: 'count', header: t('columns.count'), sortable: true, align: 'end' },
    ],
    attendance: [
      { key: 'category', header: t('columns.status'), sortable: true },
      { key: 'count', header: t('columns.count'), sortable: true, align: 'end' },
    ],
    leave: [
      { key: 'category', header: t('columns.status'), sortable: true },
      { key: 'count', header: t('columns.count'), sortable: true, align: 'end' },
    ],
    payroll: [
      { key: 'period', header: t('columns.period'), sortable: true },
      { key: 'status', header: t('columns.status'), sortable: true },
      { key: 'totalAmount', header: t('columns.totalAmount'), sortable: true, align: 'end' },
      { key: 'employeeCount', header: t('columns.employeeCount'), sortable: true, align: 'end' },
    ],
  }

  const chartConfigs = {
    employees: [
      { type: 'pie' as const, dataKey: 'count', nameKey: 'category', labelKey: 'charts.employeeDistribution' },
    ],
    attendance: [
      { type: 'bar' as const, dataKey: 'count', nameKey: 'category', labelKey: 'charts.attendanceOverview' },
    ],
    leave: [
      { type: 'bar' as const, dataKey: 'count', nameKey: 'category', labelKey: 'charts.leaveOverview' },
    ],
    payroll: [
      { type: 'bar' as const, dataKey: 'totalAmount', nameKey: 'period', labelKey: 'charts.payrollSummary' },
    ],
  }

  const totalEmployees = data.reduce((sum, row) => sum + Number(row.count || 0), 0)

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
              {tHr(`employee.${tab}`)}
            </button>
          )
        })}
      </div>

      <ReportBuilder
        title={tHr(`employee.${activeTab}`)}
        description={t('hr.description', { tab: tHr(`employee.${activeTab}`) })}
        breadcrumbs={
          <span className="text-sm text-content-muted">
            {tHr('employee.title')} / {tHr(`employee.${activeTab}`)}
          </span>
        }
        parameters={filters}
        columns={columns[activeTab]}
        data={data}
        charts={chartConfigs[activeTab]}
        summaryCards={[
          {
            id: 'total',
            labelKey: 'hr.summary.total',
            value: totalEmployees,
            tone: 'primary',
            icon: Users,
          },
        ]}
        loading={loading}
        error={error}
        onRefresh={refresh}
        reportFilename={`hr-${activeTab}-report`}
      />
    </div>
  )
}
