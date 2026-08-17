import { useAuth } from '@/hooks/useAuth'
import { RevenueVsExpensesChart } from './charts/RevenueVsExpensesChart'
import { SalesTrendChart } from './charts/SalesTrendChart'
import { ExpenseTrendChart } from './charts/ExpenseTrendChart'
import { InventoryDistributionChart } from './charts/InventoryDistributionChart'
import { EmployeeDistributionChart } from './charts/EmployeeDistributionChart'
import type { MonthlyData, CategoryData, DepartmentData } from '../types/dashboard.types'

interface ChartsSectionProps {
  revenueVsExpenses: MonthlyData[]
  salesTrend: MonthlyData[]
  expenseTrend: MonthlyData[]
  inventoryDistribution: CategoryData[]
  employeeDistribution: DepartmentData[]
  loading?: boolean
}

export function ChartsSection({
  revenueVsExpenses,
  salesTrend,
  expenseTrend,
  inventoryDistribution,
  employeeDistribution,
  loading,
}: ChartsSectionProps) {
  const { session } = useAuth()

  const hasFinance = session?.permissionCodes.some(p => p.startsWith('finance.')) ?? false
  const hasSales = session?.permissionCodes.some(p => p.startsWith('sales.')) ?? false
  const hasInventory = session?.permissionCodes.some(p => p.startsWith('inventory.')) ?? false
  const hasHr = session?.permissionCodes.some(p => p.startsWith('hr.')) ?? false

  const showRevenue = hasFinance && revenueVsExpenses.length > 0
  const showSales = hasSales && salesTrend.length > 0
  const showExpenses = hasFinance && expenseTrend.length > 0
  const showInventory = hasInventory && inventoryDistribution.length > 0
  const showEmployees = hasHr && employeeDistribution.length > 0

  const visibleCharts = [showRevenue, showSales, showExpenses, showInventory, showEmployees].filter(Boolean).length

  if (visibleCharts === 0 && !loading) return null

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {showRevenue && <RevenueVsExpensesChart data={revenueVsExpenses} loading={loading} />}
      {showSales && <SalesTrendChart data={salesTrend} loading={loading} />}
      {showExpenses && <ExpenseTrendChart data={expenseTrend} loading={loading} />}
      {showInventory && <InventoryDistributionChart data={inventoryDistribution} loading={loading} />}
      {showEmployees && <EmployeeDistributionChart data={employeeDistribution} loading={loading} />}
    </div>
  )
}

export default ChartsSection
