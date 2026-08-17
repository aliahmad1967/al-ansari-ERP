import type {
  DashboardData,
  KpiData,
  MonthlyData,
  CategoryData,
  DepartmentData,
  ApprovalItem,
  TransactionItem,
  ActivityLogItem,
  NotificationItem,
  QuickAction,
} from '../types/dashboard.types'
import {
  Users,
  DollarSign,
  ShoppingCart,
  Package,
  Clock,
  CreditCard,
  BarChart3,
  TrendingUp,
  FileText,
  AlertTriangle,
  Settings,
} from 'lucide-react'

const STORAGE_KEY = 'al-ansari:dashboard-demo'

function generateMonthlyData(): MonthlyData[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months.map((month) => ({
    month,
    revenue: Math.floor(Math.random() * 500000) + 800000,
    expenses: Math.floor(Math.random() * 300000) + 500000,
    sales: Math.floor(Math.random() * 400000) + 600000,
  }))
}

function generateInventoryDistribution(): CategoryData[] {
  return [
    { name: 'Electronics', value: 450000 },
    { name: 'Furniture', value: 280000 },
    { name: 'Stationery', value: 120000 },
    { name: 'Raw Materials', value: 380000 },
    { name: 'Finished Goods', value: 520000 },
  ]
}

function generateEmployeeDistribution(): DepartmentData[] {
  return [
    { name: 'Engineering', count: 45 },
    { name: 'Sales', count: 32 },
    { name: 'HR', count: 12 },
    { name: 'Finance', count: 15 },
    { name: 'Operations', count: 28 },
    { name: 'Marketing', count: 18 },
  ]
}

function generatePendingApprovals(): ApprovalItem[] {
  return [
    { id: '1', title: 'Purchase Order #PO-2024-045', type: 'Procurement', requestedBy: 'Ahmad Hassan', requestedAt: '2024-01-15T10:30:00Z' },
    { id: '2', title: 'Leave Request #LR-2024-012', type: 'HR', requestedBy: 'Sara Ali', requestedAt: '2024-01-15T09:15:00Z' },
    { id: '3', title: 'Expense Report #ER-2024-008', type: 'Finance', requestedBy: 'Omar Khan', requestedAt: '2024-01-14T16:45:00Z' },
    { id: '4', title: 'Sales Order #SO-2024-123', type: 'Sales', requestedBy: 'Fatima Zaid', requestedAt: '2024-01-14T14:20:00Z' },
    { id: '5', title: 'Budget Allocation #BA-2024-003', type: 'Finance', requestedBy: 'Mohammed Saleh', requestedAt: '2024-01-14T11:00:00Z' },
  ]
}

function generateRecentTransactions(): TransactionItem[] {
  return [
    { id: '1', description: 'Invoice #INV-2024-089', type: 'Revenue', amount: 45000, date: '2024-01-15T08:00:00Z' },
    { id: '2', description: 'Payment to Supplier ABC', type: 'Expense', amount: -12500, date: '2024-01-15T07:30:00Z' },
    { id: '3', description: 'Salary Transfer Batch', type: 'Expense', amount: -156000, date: '2024-01-14T22:00:00Z' },
    { id: '4', description: 'Customer Payment #CP-2024-034', type: 'Revenue', amount: 78000, date: '2024-01-14T15:00:00Z' },
    { id: '5', description: 'Office Rent Payment', type: 'Expense', amount: -35000, date: '2024-01-14T10:00:00Z' },
    { id: '6', description: 'Service Contract #SC-2024-012', type: 'Revenue', amount: 92000, date: '2024-01-13T16:30:00Z' },
  ]
}

function generateRecentActivity(): ActivityLogItem[] {
  return [
    { id: '1', action: 'Created', entity: 'Purchase Order #PO-2024-045', user: 'Ahmad Hassan', timestamp: '2024-01-15T10:30:00Z', tone: 'info' },
    { id: '2', action: 'Approved', entity: 'Invoice #INV-2024-089', user: 'Sara Ali', timestamp: '2024-01-15T09:45:00Z', tone: 'success' },
    { id: '3', action: 'Updated', entity: 'Product Catalog', user: 'Omar Khan', timestamp: '2024-01-15T09:00:00Z', tone: 'primary' },
    { id: '4', action: 'Deleted', entity: 'Draft Quotation #QT-2024-007', user: 'Fatima Zaid', timestamp: '2024-01-14T17:00:00Z', tone: 'danger' },
    { id: '5', action: 'Exported', entity: 'Monthly Report', user: 'Mohammed Saleh', timestamp: '2024-01-14T16:00:00Z', tone: 'primary' },
  ]
}

function generateNotifications(): NotificationItem[] {
  return [
    { id: '1', title: 'New Purchase Order', message: 'A new purchase order requires your approval', read: false, createdAt: '2024-01-15T10:30:00Z' },
    { id: '2', title: 'Invoice Overdue', message: 'Invoice #INV-2024-089 is past due', read: false, createdAt: '2024-01-15T08:00:00Z' },
    { id: '3', title: 'Leave Request', message: 'Sara Ali has submitted a leave request', read: true, createdAt: '2024-01-14T15:00:00Z' },
    { id: '4', title: 'Stock Alert', message: 'Product SKU-001 is below minimum stock level', read: false, createdAt: '2024-01-14T12:00:00Z' },
  ]
}

function generateQuickActions(): QuickAction[] {
  return [
    { id: '1', labelKey: 'dashboard:actions.newInvoice', icon: FileText, route: '/finance/invoices/new', permission: 'finance.invoice.create' },
    { id: '2', labelKey: 'dashboard:actions.newOrder', icon: ShoppingCart, route: '/sales/orders/new', permission: 'sales.sales-order.create' },
    { id: '3', labelKey: 'dashboard:actions.newPurchase', icon: Package, route: '/procurement/new', permission: 'procurement.purchase-order.create' },
    { id: '4', labelKey: 'dashboard:actions.manageInventory', icon: BarChart3, route: '/inventory', permission: 'inventory.product.view' },
    { id: '5', labelKey: 'dashboard:actions.viewReports', icon: TrendingUp, route: '/reports', permission: 'reports.report.view' },
    { id: '6', labelKey: 'dashboard:actions.settings', icon: Settings, route: '/settings', permission: 'settings.system.view' },
  ]
}

function getStoredData(): DashboardData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as DashboardData
  } catch {
    return null
  }
}

function storeData(data: DashboardData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // localStorage full or unavailable
  }
}

export async function getDashboardData(userPermissions: string[]): Promise<DashboardData> {
  const cached = getStoredData()
  if (cached) return cached

  const hasFinance = userPermissions.some(p => p.startsWith('finance.'))
  const hasInventory = userPermissions.some(p => p.startsWith('inventory.'))
  const hasSales = userPermissions.some(p => p.startsWith('sales.'))
  const hasHr = userPermissions.some(p => p.startsWith('hr.'))

  const monthlyData = generateMonthlyData()

  const kpis: KpiData[] = []

  if (hasHr) {
    kpis.push({
      id: 'employees',
      labelKey: 'dashboard:kpi.totalEmployees',
      value: '156',
      icon: Users,
      tone: 'primary',
      trend: 8,
      trendLabelKey: 'dashboard:kpi.vsLastMonth',
      permission: 'hr.employee.view',
    })
  }

  if (hasFinance) {
    kpis.push({
      id: 'revenue',
      labelKey: 'dashboard:kpi.monthlyRevenue',
      value: 'SAR 1,250,000',
      icon: DollarSign,
      tone: 'success',
      trend: 12,
      trendLabelKey: 'dashboard:kpi.vsLastMonth',
      permission: 'finance.invoice.view',
    })

    kpis.push({
      id: 'expenses',
      labelKey: 'dashboard:kpi.monthlyExpenses',
      value: 'SAR 890,000',
      icon: CreditCard,
      tone: 'warning',
      trend: -5,
      trendLabelKey: 'dashboard:kpi.vsLastMonth',
      permission: 'finance.invoice.view',
    })
  }

  if (hasInventory) {
    kpis.push({
      id: 'inventory',
      labelKey: 'dashboard:kpi.inventoryValue',
      value: 'SAR 2,340,000',
      icon: Package,
      tone: 'info',
      trend: 3,
      trendLabelKey: 'dashboard:kpi.vsLastMonth',
      permission: 'inventory.product.view',
    })
  }

  kpis.push({
    id: 'approvals',
    labelKey: 'dashboard:kpi.pendingApprovals',
    value: '12',
    icon: Clock,
    tone: 'danger',
    trend: 0,
    trendLabelKey: 'dashboard:kpi.vsLastMonth',
    permission: 'dashboard.dashboard.view',
  })

  if (hasFinance) {
    kpis.push({
      id: 'receivables',
      labelKey: 'dashboard:kpi.outstandingReceivables',
      value: 'SAR 456,000',
      icon: AlertTriangle,
      tone: 'warning',
      trend: -8,
      trendLabelKey: 'dashboard:kpi.vsLastMonth',
      permission: 'finance.invoice.view',
    })
  }

  const data: DashboardData = {
    kpis,
    revenueVsExpenses: hasFinance ? monthlyData : [],
    salesTrend: hasSales ? monthlyData : [],
    expenseTrend: hasFinance ? monthlyData : [],
    inventoryDistribution: hasInventory ? generateInventoryDistribution() : [],
    employeeDistribution: hasHr ? generateEmployeeDistribution() : [],
    pendingApprovals: generatePendingApprovals(),
    recentTransactions: generateRecentTransactions(),
    recentActivity: generateRecentActivity(),
    notifications: generateNotifications(),
    quickActions: generateQuickActions(),
  }

  storeData(data)
  return data
}

export function clearDashboardCache(): void {
  localStorage.removeItem(STORAGE_KEY)
}
