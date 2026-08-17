import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart3, Package, AlertTriangle, DollarSign, Warehouse, TrendingUp } from 'lucide-react'

import PageLayout from '@/components/layout/PageLayout'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { formatMoney } from '@/core/utils/currency'

export default function Reports() {
  const { t } = useTranslation('inventory')
  const [summary] = useState(() => ({
    totalProducts: 0,
    totalCategories: 0,
    totalWarehouses: 0,
    lowStockItems: 0,
    totalStockValue: 0,
    pendingTransfers: 0,
  }))

  const statCards = [
    { label: t('stats.totalProducts'), value: summary.totalProducts, icon: Package, color: 'text-blue-500' },
    { label: t('stats.totalCategories'), value: summary.totalCategories, icon: BarChart3, color: 'text-green-500' },
    { label: t('stats.totalWarehouses'), value: summary.totalWarehouses, icon: Warehouse, color: 'text-purple-500' },
    { label: t('stats.lowStockItems'), value: summary.lowStockItems, icon: AlertTriangle, color: 'text-yellow-500' },
    { label: t('stats.totalStockValue'), value: formatMoney(summary.totalStockValue), icon: DollarSign, color: 'text-emerald-500' },
    { label: t('stats.pendingTransfers'), value: summary.pendingTransfers, icon: TrendingUp, color: 'text-orange-500' },
  ]

  return (
    <RequirePermission permission="inventory.reports.view">
      <PageLayout
        title={t('reports.title')}
        description={t('reports.title')}
        icon={<BarChart3 className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="flex items-center gap-4 rounded-lg border border-border bg-surface-raised p-4"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-surface ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-content-muted">{card.label}</p>
                <p className="text-2xl font-semibold text-content">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold text-content">{t('reports.title')}</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: t('reports.stockBalance'), icon: Package },
              { label: t('reports.stockMovements'), icon: BarChart3 },
              { label: t('reports.lowStock'), icon: AlertTriangle },
              { label: t('reports.valuation'), icon: DollarSign },
              { label: t('reports.warehouse'), icon: Warehouse },
              { label: t('reports.productMovement'), icon: TrendingUp },
            ].map((report) => (
              <button
                key={report.label}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface-raised p-4 text-left transition-colors hover:bg-surface-hover"
              >
                <report.icon className="h-5 w-5 text-content-muted" />
                <span className="font-medium text-content">{report.label}</span>
              </button>
            ))}
          </div>
        </div>
      </PageLayout>
    </RequirePermission>
  )
}
