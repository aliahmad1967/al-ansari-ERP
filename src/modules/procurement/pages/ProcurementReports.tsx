import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart3, Users, ShoppingCart, DollarSign, FileText, Clock, TrendingUp } from 'lucide-react'

import PageLayout from '@/components/layout/PageLayout'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { formatMoney } from '@/core/utils/currency'

export default function ProcurementReports() {
  const { t } = useTranslation('procurement')
  const [summary] = useState(() => ({
    totalSuppliers: 0,
    activeSuppliers: 0,
    pendingOrders: 0,
    totalOrderValue: 0,
    overdueInvoices: 0,
    totalPaid: 0,
  }))

  const statCards = [
    { label: t('stats.totalSuppliers'), value: summary.totalSuppliers, icon: Users, color: 'text-blue-500' },
    { label: t('stats.activeSuppliers'), value: summary.activeSuppliers, icon: Users, color: 'text-green-500' },
    { label: t('stats.pendingOrders'), value: summary.pendingOrders, icon: ShoppingCart, color: 'text-yellow-500' },
    { label: t('stats.totalOrderValue'), value: formatMoney(summary.totalOrderValue), icon: DollarSign, color: 'text-emerald-500' },
    { label: t('stats.overdueInvoices'), value: summary.overdueInvoices, icon: Clock, color: 'text-red-500' },
    { label: t('stats.totalPaid'), value: formatMoney(summary.totalPaid), icon: TrendingUp, color: 'text-purple-500' },
  ]

  return (
    <RequirePermission permission="procurement.reports.view">
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
              { label: t('reports.supplierSummary'), icon: Users },
              { label: t('reports.purchaseRequestReport'), icon: FileText },
              { label: t('reports.purchaseOrderReport'), icon: ShoppingCart },
              { label: t('reports.goodsReceiptReport'), icon: BarChart3 },
              { label: t('reports.invoiceAging'), icon: Clock },
              { label: t('reports.paymentHistory'), icon: TrendingUp },
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
