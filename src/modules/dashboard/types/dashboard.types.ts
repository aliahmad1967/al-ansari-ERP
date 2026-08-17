import type { LucideIcon } from 'lucide-react'
import type { Tone } from '@/types/common'

export interface KpiData {
  id: string
  labelKey: string
  value: string
  icon: LucideIcon
  tone: Tone
  trend?: number | null
  trendLabelKey?: string
  permission?: string
  isDemo?: boolean
}

export interface MonthlyData {
  month: string
  revenue?: number
  expenses?: number
  sales?: number
}

export interface CategoryData {
  name: string
  value: number
}

export interface DepartmentData {
  name: string
  count: number
}

export interface ApprovalItem {
  id: string
  title: string
  type: string
  requestedBy: string
  requestedAt: string
}

export interface TransactionItem {
  id: string
  description: string
  type: string
  amount: number
  date: string
}

export interface ActivityLogItem {
  id: string
  action: string
  entity: string
  user: string
  timestamp: string
  tone: Tone
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export interface QuickAction {
  id: string
  labelKey: string
  icon: LucideIcon
  route: string
  permission?: string
}

export interface DashboardData {
  kpis: KpiData[]
  revenueVsExpenses: MonthlyData[]
  salesTrend: MonthlyData[]
  expenseTrend: MonthlyData[]
  inventoryDistribution: CategoryData[]
  employeeDistribution: DepartmentData[]
  pendingApprovals: ApprovalItem[]
  recentTransactions: TransactionItem[]
  recentActivity: ActivityLogItem[]
  notifications: NotificationItem[]
  quickActions: QuickAction[]
}
