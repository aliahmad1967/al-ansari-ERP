import { getActiveRealm } from '@/core/database/realm'
import type { ReportDataPoint } from '../types/report.types'

function getRealm() {
  return getActiveRealm()
}

function safeQuery(className: string, predicate?: string): Record<string, unknown>[] {
  try {
    const realm = getRealm()
    let results = realm.objects(className)
    if (predicate) {
      results = results.filtered(predicate)
    }
    return (results as unknown as Record<string, unknown>[]).map((obj) => ({ ...obj }))
  } catch {
    return []
  }
}

export class ReportService {
  getHrEmployeeSummary(): ReportDataPoint[] {
    const employees = safeQuery('Employee', 'isDeleted == false')
    const departments = safeQuery('Department', 'isDeleted == false')

    const deptMap = new Map<string, string>()
    for (const d of departments) {
      deptMap.set(String(d._id), String(d.name ?? ''))
    }

    const statusCounts: Record<string, number> = {}
    const deptCounts: Record<string, number> = {}

    for (const emp of employees) {
      const status = String(emp.status || 'Unknown')
      statusCounts[status] = (statusCounts[status] || 0) + 1
      const deptId = emp.departmentId ? String(emp.departmentId) : ''
      const deptName = deptMap.get(deptId) ?? 'Unassigned'
      deptCounts[deptName] = (deptCounts[deptName] || 0) + 1
    }

    const result: ReportDataPoint[] = []
    for (const [status, count] of Object.entries(statusCounts)) {
      result.push({ category: status, count })
    }
    if (result.length === 0) {
      result.push({ category: 'Total Employees', count: employees.length })
    }
    return result
  }

  getHrAttendanceSummary(): ReportDataPoint[] {
    const records = safeQuery('AttendanceRecord')
    const statusCounts: Record<string, number> = {}
    for (const rec of records) {
      const status = String(rec.status || 'Unknown')
      statusCounts[status] = (statusCounts[status] || 0) + 1
    }
    if (Object.keys(statusCounts).length === 0) {
      return [{ category: 'No Records', count: 0 }]
    }
    return Object.entries(statusCounts).map(([category, count]) => ({ category, count }))
  }

  getHrLeaveSummary(): ReportDataPoint[] {
    const leaves = safeQuery('LeaveRequest')
    const statusCounts: Record<string, number> = {}
    for (const leave of leaves) {
      const status = String(leave.status || 'Unknown')
      statusCounts[status] = (statusCounts[status] || 0) + 1
    }
    if (Object.keys(statusCounts).length === 0) {
      return [{ category: 'No Requests', count: 0 }]
    }
    return Object.entries(statusCounts).map(([category, count]) => ({ category, count }))
  }

  getHrPayrollSummary(): ReportDataPoint[] {
    const runs = safeQuery('PayrollRun', 'isDeleted == false')
    if (runs.length === 0) {
      return [{ category: 'No Payroll Runs', count: 0 }]
    }
    return runs.map((run) => ({
      category: String(run.periodId || 'N/A'),
      status: String(run.status || 'Unknown'),
      totalAmount: Number(run.totalAmount || 0),
      employeeCount: Number(run.employeeCount || 0),
    }))
  }

  getInventoryStockSummary(): ReportDataPoint[] {
    const balances = safeQuery('StockBalance')
    const products = safeQuery('Product', 'isDeleted == false')
    const warehouses = safeQuery('Warehouse', 'isDeleted == false')

    const productMap = new Map<string, string>()
    for (const p of products) {
      productMap.set(String(p._id), String(p.name ?? ''))
    }
    const warehouseMap = new Map<string, string>()
    for (const w of warehouses) {
      warehouseMap.set(String(w._id), String(w.name ?? ''))
    }

    const result: ReportDataPoint[] = []
    for (const bal of balances) {
      const productId = String(bal.productId ?? '')
      const warehouseId = String(bal.warehouseId ?? '')
      const quantity = Number(bal.quantity || 0)
      const unitCost = Number(bal.unitCost || 0)
      result.push({
        product: productMap.get(productId) ?? productId,
        warehouse: warehouseMap.get(warehouseId) ?? warehouseId,
        quantity,
        unitCost,
        totalValue: quantity * unitCost,
      })
    }
    return result
  }

  getInventoryMovementsSummary(): ReportDataPoint[] {
    const movements = safeQuery('StockMovement')
    const typeCounts: Record<string, number> = {}
    for (const m of movements) {
      const type = String(m.movementType || 'Unknown')
      typeCounts[type] = (typeCounts[type] || 0) + 1
    }
    if (Object.keys(typeCounts).length === 0) {
      return [{ category: 'No Movements', count: 0 }]
    }
    return Object.entries(typeCounts).map(([category, count]) => ({ category, count }))
  }

  getInventoryValuation(): ReportDataPoint[] {
    const balances = safeQuery('StockBalance')
    const products = safeQuery('Product', 'isDeleted == false')
    const productMap = new Map<string, string>()
    for (const p of products) {
      productMap.set(String(p._id), String(p.name ?? ''))
    }

    let totalValue = 0
    const result: ReportDataPoint[] = []
    for (const bal of balances) {
      const productId = String(bal.productId ?? '')
      const quantity = Number(bal.quantity || 0)
      const unitCost = Number(bal.unitCost || 0)
      const value = quantity * unitCost
      totalValue += value
      result.push({
        product: productMap.get(productId) ?? productId,
        quantity,
        unitCost,
        totalValue: value,
      })
    }
    return [{ category: 'Total Inventory Value', value: totalValue }, ...result]
  }

  getProcurementOrdersSummary(): ReportDataPoint[] {
    const orders = safeQuery('PurchaseOrder', 'isDeleted == false')
    const statusCounts: Record<string, number> = {}
    for (const order of orders) {
      const status = String(order.status || 'Unknown')
      statusCounts[status] = (statusCounts[status] || 0) + 1
    }
    if (Object.keys(statusCounts).length === 0) {
      return [{ category: 'No Orders', count: 0 }]
    }
    return Object.entries(statusCounts).map(([category, count]) => ({ category, count }))
  }

  getProcurementBySupplier(): ReportDataPoint[] {
    const orders = safeQuery('PurchaseOrder', 'isDeleted == false')
    const suppliers = safeQuery('Supplier', 'isDeleted == false')
    const supplierMap = new Map<string, string>()
    for (const s of suppliers) {
      supplierMap.set(String(s._id), String(s.name ?? ''))
    }

    const supplierTotals: Record<string, number> = {}
    for (const order of orders) {
      const supplierId = String(order.supplierId ?? '')
      const name = supplierMap.get(supplierId) ?? 'Unknown'
      supplierTotals[name] = (supplierTotals[name] || 0) + Number(order.totalAmount || 0)
    }
    if (Object.keys(supplierTotals).length === 0) {
      return [{ category: 'No Spending', value: 0 }]
    }
    return Object.entries(supplierTotals).map(([category, value]) => ({ category, value }))
  }

  getSalesSummary(): ReportDataPoint[] {
    const invoices = safeQuery('SalesInvoice', 'isDeleted == false')
    const statusCounts: Record<string, number> = {}
    for (const inv of invoices) {
      const status = String(inv.status || 'Unknown')
      statusCounts[status] = (statusCounts[status] || 0) + 1
    }
    if (Object.keys(statusCounts).length === 0) {
      return [{ category: 'No Invoices', count: 0 }]
    }
    return Object.entries(statusCounts).map(([category, count]) => ({ category, count }))
  }

  getSalesRevenue(): ReportDataPoint[] {
    const invoices = safeQuery('SalesInvoice', 'isDeleted == false')
    let totalRevenue = 0
    let paidRevenue = 0
    let unpaidRevenue = 0

    for (const inv of invoices) {
      const amount = Number(inv.totalAmount || 0)
      totalRevenue += amount
      if (inv.status === 'paid') {
        paidRevenue += amount
      } else {
        unpaidRevenue += amount
      }
    }

    return [
      { category: 'Total Revenue', value: totalRevenue },
      { category: 'Paid', value: paidRevenue },
      { category: 'Unpaid', value: unpaidRevenue },
    ]
  }

  getAssetsSummary(): ReportDataPoint[] {
    const assets = safeQuery('Asset', 'isDeleted == false')

    const statusCounts: Record<string, number> = {}
    let totalValue = 0
    for (const asset of assets) {
      const status = String(asset.status || 'Unknown')
      statusCounts[status] = (statusCounts[status] || 0) + 1
      totalValue += Number(asset.purchaseValue || 0)
    }

    return [
      ...Object.entries(statusCounts).map(([category, count]) => ({ category, count })),
      { category: 'Total Asset Value', value: totalValue },
    ]
  }

  getAssetsByCategory(): ReportDataPoint[] {
    const assets = safeQuery('Asset', 'isDeleted == false')
    const categoryTotals: Record<string, number> = {}

    for (const asset of assets) {
      const cat = String(asset.categoryId || 'Uncategorized')
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(asset.purchaseValue || 0)
    }
    if (Object.keys(categoryTotals).length === 0) {
      return [{ category: 'No Assets', value: 0 }]
    }
    return Object.entries(categoryTotals).map(([category, value]) => ({ category, value }))
  }

  getProjectsSummary(): ReportDataPoint[] {
    const projects = safeQuery('Project', 'isDeleted == false')

    const statusCounts: Record<string, number> = {}
    for (const proj of projects) {
      const status = String(proj.status || 'Unknown')
      statusCounts[status] = (statusCounts[status] || 0) + 1
    }
    if (Object.keys(statusCounts).length === 0) {
      return [{ category: 'No Projects', count: 0 }]
    }
    return Object.entries(statusCounts).map(([category, count]) => ({ category, count }))
  }

  getProjectsTasksSummary(): ReportDataPoint[] {
    const tasks = safeQuery('Task', 'isDeleted == false')
    const statusCounts: Record<string, number> = {}
    for (const task of tasks) {
      const status = String(task.status || 'Unknown')
      statusCounts[status] = (statusCounts[status] || 0) + 1
    }
    if (Object.keys(statusCounts).length === 0) {
      return [{ category: 'No Tasks', count: 0 }]
    }
    return Object.entries(statusCounts).map(([category, count]) => ({ category, count }))
  }

  getAccountingJournalSummary(): ReportDataPoint[] {
    const entries = safeQuery('JournalEntry', 'isDeleted == false')
    const statusCounts: Record<string, number> = {}
    let totalDebit = 0
    let totalCredit = 0

    for (const entry of entries) {
      const status = String(entry.status || 'Unknown')
      statusCounts[status] = (statusCounts[status] || 0) + 1
      totalDebit += Number(entry.totalDebit || 0)
      totalCredit += Number(entry.totalCredit || 0)
    }

    return [
      ...Object.entries(statusCounts).map(([category, count]) => ({ category, count })),
      { category: 'Total Debit', value: totalDebit },
      { category: 'Total Credit', value: totalCredit },
    ]
  }
}

export const reportService = new ReportService()
