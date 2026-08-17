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

const DEPT_LABELS: Record<string, string> = {
  'dept-eng': 'Engineering',
  'dept-sales': 'Sales',
  'dept-hr': 'Human Resources',
  'dept-finance': 'Finance',
  'dept-ops': 'Operations',
  'dept-mktg': 'Marketing',
  'dept-admin': 'Administration',
}

function generateMonthlyData(totalPayroll: number): MonthlyData[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const baseRevenue = totalPayroll * 2.5
  return months.map((month, i) => ({
    month,
    revenue: Math.round(baseRevenue * (0.85 + i * 0.025) + (i % 3 === 0 ? 50000 : 0)),
    expenses: Math.round(totalPayroll * (0.9 + i * 0.01) + (i % 4 === 0 ? 30000 : 0)),
    sales: Math.round(baseRevenue * (0.8 + i * 0.03) + (i % 2 === 0 ? 40000 : 0)),
  }))
}

function generateInventoryDistribution(totalPayroll: number): CategoryData[] {
  const base = totalPayroll * 0.3
  return [
    { name: 'Electronics', value: Math.round(base * 1.8) },
    { name: 'Furniture', value: Math.round(base * 1.1) },
    { name: 'Stationery', value: Math.round(base * 0.5) },
    { name: 'Raw Materials', value: Math.round(base * 1.5) },
    { name: 'Finished Goods', value: Math.round(base * 2.1) },
  ]
}

function generatePendingApprovals(employees: { firstName: string; lastName: string }[]): ApprovalItem[] {
  const names = employees.slice(0, 5).map(e => `${e.firstName} ${e.lastName}`)
  return [
    { id: '1', title: 'Purchase Order #PO-2024-045', type: 'Procurement', requestedBy: names[0] ?? 'Ahmad Hassan', requestedAt: '2024-01-15T10:30:00Z' },
    { id: '2', title: 'Leave Request #LR-2024-012', type: 'HR', requestedBy: names[1] ?? 'Sara Ali', requestedAt: '2024-01-15T09:15:00Z' },
    { id: '3', title: 'Expense Report #ER-2024-008', type: 'Finance', requestedBy: names[2] ?? 'Omar Khan', requestedAt: '2024-01-14T16:45:00Z' },
    { id: '4', title: 'Sales Order #SO-2024-123', type: 'Sales', requestedBy: names[3] ?? 'Fatima Zaid', requestedAt: '2024-01-14T14:20:00Z' },
    { id: '5', title: 'Budget Allocation #BA-2024-003', type: 'Finance', requestedBy: names[4] ?? 'Mohammed Saleh', requestedAt: '2024-01-14T11:00:00Z' },
  ]
}

function generateRecentTransactions(totalPayroll: number): TransactionItem[] {
  return [
    { id: '1', description: 'Invoice #INV-2024-089', type: 'Revenue', amount: Math.round(totalPayroll * 0.3), date: '2024-01-15T08:00:00Z' },
    { id: '2', description: 'Payment to Supplier ABC', type: 'Expense', amount: -Math.round(totalPayroll * 0.08), date: '2024-01-15T07:30:00Z' },
    { id: '3', description: 'Salary Transfer Batch', type: 'Expense', amount: -totalPayroll, date: '2024-01-14T22:00:00Z' },
    { id: '4', description: 'Customer Payment #CP-2024-034', type: 'Revenue', amount: Math.round(totalPayroll * 0.5), date: '2024-01-14T15:00:00Z' },
    { id: '5', description: 'Office Rent Payment', type: 'Expense', amount: -Math.round(totalPayroll * 0.22), date: '2024-01-14T10:00:00Z' },
    { id: '6', description: 'Service Contract #SC-2024-012', type: 'Revenue', amount: Math.round(totalPayroll * 0.6), date: '2024-01-13T16:30:00Z' },
  ]
}

function generateRecentActivity(employees: { firstName: string; lastName: string }[]): ActivityLogItem[] {
  const names = employees.slice(0, 5).map(e => `${e.firstName} ${e.lastName}`)
  return [
    { id: '1', action: 'Created', entity: 'Purchase Order #PO-2024-045', user: names[0] ?? 'Ahmad Hassan', timestamp: '2024-01-15T10:30:00Z', tone: 'info' },
    { id: '2', action: 'Approved', entity: 'Invoice #INV-2024-089', user: names[1] ?? 'Sara Ali', timestamp: '2024-01-15T09:45:00Z', tone: 'success' },
    { id: '3', action: 'Updated', entity: 'Product Catalog', user: names[2] ?? 'Omar Khan', timestamp: '2024-01-15T09:00:00Z', tone: 'primary' },
    { id: '4', action: 'Archived', entity: `Employee ${names[3] ?? 'Bilal Farid'}`, user: names[1] ?? 'Sara Ali', timestamp: '2024-01-14T17:00:00Z', tone: 'danger' },
    { id: '5', action: 'Exported', entity: 'Monthly Report', user: names[4] ?? 'Mohammed Saleh', timestamp: '2024-01-14T16:00:00Z', tone: 'primary' },
  ]
}

function generateNotifications(employees: { firstName: string; lastName: string }[]): NotificationItem[] {
  const names = employees.slice(0, 3).map(e => `${e.firstName} ${e.lastName}`)
  return [
    { id: '1', title: 'New Purchase Order', message: 'A new purchase order requires your approval', read: false, createdAt: '2024-01-15T10:30:00Z' },
    { id: '2', title: 'Invoice Overdue', message: 'Invoice #INV-2024-089 is past due', read: false, createdAt: '2024-01-15T08:00:00Z' },
    { id: '3', title: 'Leave Request', message: `${names[1] ?? 'Sara Ali'} has submitted a leave request`, read: true, createdAt: '2024-01-14T15:00:00Z' },
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

async function getEmployeeData(): Promise<{
  total: number
  active: number
  terminated: number
  distribution: DepartmentData[]
  totalPayroll: number
  employees: { firstName: string; lastName: string }[]
}> {
  try {
    const { devEmployeeService } = await import('@/core/services/DevEmployeeService')
    const employees = devEmployeeService.getEmployees()
    const contracts = devEmployeeService.getContracts()
    const total = employees.length
    const active = employees.filter(e => e.status === 'active').length
    const terminated = employees.filter(e => e.status === 'terminated').length

    const totalPayroll = contracts
      .filter(c => c.status === 'active' && !c.isDeleted)
      .reduce((sum, c) => sum + (c.salary ?? 0), 0)

    const deptCounts = new Map<string, number>()
    for (const emp of employees) {
      const dept = DEPT_LABELS[emp.departmentId ?? ''] ?? 'Unassigned'
      deptCounts.set(dept, (deptCounts.get(dept) ?? 0) + 1)
    }
    const distribution: DepartmentData[] = Array.from(deptCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    return { total, active, terminated, distribution, totalPayroll, employees: employees.map(e => ({ firstName: e.firstName, lastName: e.lastName })) }
  } catch {
    return { total: 0, active: 0, terminated: 0, distribution: [], totalPayroll: 0, employees: [] }
  }
}

function formatCurrency(amount: number): string {
  return `SAR ${amount.toLocaleString()}`
}

export async function getDashboardData(userPermissions: string[]): Promise<DashboardData> {
  const hasFinance = userPermissions.some(p => p.startsWith('finance.'))
  const hasInventory = userPermissions.some(p => p.startsWith('inventory.'))
  const hasSales = userPermissions.some(p => p.startsWith('sales.'))
  const hasHr = userPermissions.some(p => p.startsWith('hr.'))

  const employeeData = hasHr ? await getEmployeeData() : null
  const totalPayroll = employeeData?.totalPayroll ?? 180000
  const employees = employeeData?.employees ?? []

  const monthlyData = generateMonthlyData(totalPayroll)

  const kpis: KpiData[] = []

  if (hasHr) {
    kpis.push({
      id: 'employees',
      labelKey: 'dashboard:kpi.totalEmployees',
      value: String(employeeData?.active ?? 0),
      icon: Users,
      tone: 'primary',
      trend: 0,
      trendLabelKey: 'dashboard:kpi.vsLastMonth',
      permission: 'hr.employee.view',
    })
  }

  if (hasFinance) {
    const revenue = Math.round(totalPayroll * 2.5)
    const expenses = Math.round(totalPayroll * 1.7)
    kpis.push({
      id: 'revenue',
      labelKey: 'dashboard:kpi.monthlyRevenue',
      value: formatCurrency(revenue),
      icon: DollarSign,
      tone: 'success',
      trend: 12,
      trendLabelKey: 'dashboard:kpi.vsLastMonth',
      permission: 'finance.invoice.view',
    })

    kpis.push({
      id: 'expenses',
      labelKey: 'dashboard:kpi.monthlyExpenses',
      value: formatCurrency(expenses),
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
      value: formatCurrency(Math.round(totalPayroll * 5)),
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
    value: '5',
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
      value: formatCurrency(Math.round(totalPayroll * 3)),
      icon: AlertTriangle,
      tone: 'warning',
      trend: -8,
      trendLabelKey: 'dashboard:kpi.vsLastMonth',
      permission: 'finance.invoice.view',
    })
  }

  return {
    kpis,
    revenueVsExpenses: hasFinance ? monthlyData : [],
    salesTrend: hasSales ? monthlyData : [],
    expenseTrend: hasFinance ? monthlyData : [],
    inventoryDistribution: hasInventory ? generateInventoryDistribution(totalPayroll) : [],
    employeeDistribution: hasHr && employeeData ? employeeData.distribution : [],
    pendingApprovals: generatePendingApprovals(employees),
    recentTransactions: generateRecentTransactions(totalPayroll),
    recentActivity: generateRecentActivity(employees),
    notifications: generateNotifications(employees),
    quickActions: generateQuickActions(),
  }
}
