import type {
  DashboardData,
  KpiData,
} from '../types/dashboard.types'
import {
  Users,
  DollarSign,
  Package,
  Clock,
  CreditCard,
  AlertTriangle,
} from 'lucide-react'

export async function getDashboardData(): Promise<DashboardData> {
  const kpis: KpiData[] = []

  kpis.push({
    id: 'employees',
    labelKey: 'dashboard:kpi.totalEmployees',
    value: '0',
    icon: Users,
    tone: 'primary',
    permission: 'hr.employee.view',
  })

  kpis.push({
    id: 'revenue',
    labelKey: 'dashboard:kpi.monthlyRevenue',
    value: 'SAR 0',
    icon: DollarSign,
    tone: 'success',
    permission: 'finance.invoice.view',
  })

  kpis.push({
    id: 'expenses',
    labelKey: 'dashboard:kpi.monthlyExpenses',
    value: 'SAR 0',
    icon: CreditCard,
    tone: 'warning',
    permission: 'finance.invoice.view',
  })

  kpis.push({
    id: 'inventory',
    labelKey: 'dashboard:kpi.inventoryValue',
    value: 'SAR 0',
    icon: Package,
    tone: 'info',
    permission: 'inventory.product.view',
  })

  kpis.push({
    id: 'approvals',
    labelKey: 'dashboard:kpi.pendingApprovals',
    value: '0',
    icon: Clock,
    tone: 'danger',
    permission: 'dashboard.dashboard.view',
  })

  kpis.push({
    id: 'receivables',
    labelKey: 'dashboard:kpi.outstandingReceivables',
    value: 'SAR 0',
    icon: AlertTriangle,
    tone: 'warning',
    permission: 'finance.invoice.view',
  })

  return {
    kpis,
    revenueVsExpenses: [],
    salesTrend: [],
    expenseTrend: [],
    inventoryDistribution: [],
    employeeDistribution: [],
    pendingApprovals: [],
    recentTransactions: [],
    recentActivity: [],
    notifications: [],
    quickActions: [],
  }
}
