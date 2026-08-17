import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ChartCard } from '@/components/dashboard/ChartCard'
import type { CategoryData } from '../../types/dashboard.types'

interface InventoryDistributionChartProps {
  data: CategoryData[]
  loading?: boolean
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function InventoryDistributionChart({ data, loading }: InventoryDistributionChartProps) {
  const { t } = useTranslation('dashboard')

  return (
    <ChartCard
      title={t('charts.inventoryDistribution.title')}
      description={t('charts.inventoryDistribution.description')}
      loading={loading}
      empty={data.length === 0}
      emptyTitle={t('charts.inventoryDistribution.empty')}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-surface-raised, #fff)',
              border: '1px solid var(--color-border, #e5e7eb)',
              borderRadius: '8px',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export default InventoryDistributionChart
