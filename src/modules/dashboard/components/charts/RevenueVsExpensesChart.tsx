import { useTranslation } from 'react-i18next'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ChartCard } from '@/components/dashboard/ChartCard'
import type { MonthlyData } from '../../types/dashboard.types'

interface RevenueVsExpensesChartProps {
  data: MonthlyData[]
  loading?: boolean
}

export function RevenueVsExpensesChart({ data, loading }: RevenueVsExpensesChartProps) {
  const { t } = useTranslation('dashboard')

  return (
    <ChartCard
      title={t('charts.revenueVsExpenses.title')}
      description={t('charts.revenueVsExpenses.description')}
      loading={loading}
      empty={data.length === 0}
      emptyTitle={t('charts.revenueVsExpenses.empty')}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
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
          <Bar dataKey="revenue" fill="#10b981" name={t('charts.revenueVsExpenses.revenue')} radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" fill="#f59e0b" name={t('charts.revenueVsExpenses.expenses')} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export default RevenueVsExpensesChart
