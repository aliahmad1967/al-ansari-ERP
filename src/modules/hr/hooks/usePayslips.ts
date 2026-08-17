import { useCallback, useEffect, useState } from 'react'

interface DevPayslip {
  _id: string
  payrollItemId: string
  employeeId: string
  periodId: string
  payslipNumber: string
  basicSalary: number
  totalEarnings: number
  totalDeductions: number
  totalBenefits: number
  netPay: number
  currency: string
  generatedAt: string
  status: string
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

interface PayslipProvider {
  getAll(): DevPayslip[]
  getById(id: string): DevPayslip | undefined
  getByEmployee(employeeId: string): DevPayslip[]
  getByPeriod(periodId: string): DevPayslip[]
}

let providerPromise: Promise<PayslipProvider> | null = null

function getProvider(): Promise<PayslipProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/hr/services/PayrollService')
      const svc = new mod.PayrollService()
      return {
        getAll: () => svc.findAllPayslips().map(r => r as unknown as DevPayslip),
        getById: (id) => svc.findPayslipById(id) as unknown as DevPayslip | null ?? undefined,
        getByEmployee: (empId) => svc.findPayslipsByEmployee(empId).map(r => r as unknown as DevPayslip),
        getByPeriod: (periodId) => svc.findPayslipsByPeriod(periodId).map(r => r as unknown as DevPayslip),
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): PayslipProvider {
  const KEY = 'erp_dev_payslips'
  const load = (): DevPayslip[] => { try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] } }
  return {
    getAll: () => load().filter(p => !p.isDeleted),
    getById: (id) => load().find(p => p._id === id),
    getByEmployee: (empId) => load().filter(p => p.employeeId === empId),
    getByPeriod: (periodId) => load().filter(p => p.periodId === periodId),
  }
}

export interface UsePayslipsResult {
  items: DevPayslip[]
  loading: boolean
  error: string | null
  refresh: () => void
}

export function usePayslips(): UsePayslipsResult {
  const [items, setItems] = useState<DevPayslip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => { if (active) { setItems(p.getAll()); setError(null) } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  return { items, loading, error, refresh }
}
