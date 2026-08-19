import { useTranslation } from 'react-i18next'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ChartCard } from '@/components/dashboard/ChartCard'
import type { ReportChartConfig, ReportDataPoint } from '../types/report.types'

const CHART_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#ec4899',
  '#14b8a6',
  '#6366f1',
]

interface ReportChartProps {
  config: ReportChartConfig
  data: ReportDataPoint[]
  loading?: boolean
}

export function ReportChart({ config, data, loading }: ReportChartProps) {
  const { t } = useTranslation('reports')

  return (
    <ChartCard
      title={t(config.labelKey)}
      loading={loading}
      empty={data.length === 0}
      emptyTitle={t('charts.noData')}
    >
      <ResponsiveContainer width="100%" height="100%">
        {renderChart(config, data)}
      </ResponsiveContainer>
    </ChartCard>
  )
}

function renderChart(config: ReportChartConfig, data: ReportDataPoint[]) {
  switch (config.type) {
    case 'bar':
      return (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey={config.nameKey} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey={config.dataKey} fill={config.color ?? CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
        </BarChart>
      )

    case 'line':
      return (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey={config.nameKey} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey={config.dataKey}
            stroke={config.color ?? CHART_COLORS[0]}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      )

    case 'area':
      return (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey={config.nameKey} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey={config.dataKey} fill={config.color ?? CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
        </BarChart>
      )

    case 'pie':
    case 'donut':
      return (
        <PieChart>
          <Pie
            data={data}
            dataKey={config.dataKey}
            nameKey={config.nameKey}
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={config.type === 'donut' ? 40 : 0}
            label
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      )

    default:
      return null
  }
}

export default ReportChart
