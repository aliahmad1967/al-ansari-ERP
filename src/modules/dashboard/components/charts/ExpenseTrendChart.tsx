import { useTranslation } from 'react-i18next'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ChartCard } from '@/components/dashboard/ChartCard'
import type { MonthlyData } from '../../types/dashboard.types'

interface ExpenseTrendChartProps {
  data: MonthlyData[]
  loading?: boolean
}

export function ExpenseTrendChart({ data, loading }: ExpenseTrendChartProps) {
  const { t } = useTranslation('dashboard')

  return (
    <ChartCard
      title={t('charts.expenseTrend.title')}
      description={t('charts.expenseTrend.description')}
      loading={loading}
      empty={data.length === 0}
      emptyTitle={t('charts.expenseTrend.empty')}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="month" className="text-xs" tick={{ fill: 'currentColor' }} />
          <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-surface-raised, #fff)',
              border: '1px solid var(--color-border, #e5e7eb)',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="expenses" stroke="#ef4444" name={t('charts.expenseTrend.expenses')} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export default ExpenseTrendChart
