import { useCallback, useEffect, useState } from 'react'

interface DevPayrollRun {
  _id: string
  periodId: string
  runNumber: number
  status: string
  totalGross: number
  totalDeductions: number
  totalNet: number
  employeeCount: number
  approvedBy: string | null
  approvedAt: string | null
  finalizedBy: string | null
  finalizedAt: string | null
  reversedBy: string | null
  reversedAt: string | null
  reversalOfId: string | null
  notes: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

interface PayrollProvider {
  getAllRuns(): DevPayrollRun[]
  getRunById(id: string): DevPayrollRun | undefined
  createRun(periodId: string, notes?: string): DevPayrollRun
  calculateRun(runId: string): DevPayrollRun
  reviewRun(runId: string): DevPayrollRun
  approveRun(runId: string, username: string): DevPayrollRun
  finalizeRun(runId: string, username: string): DevPayrollRun
  reverseRun(runId: string, reason: string, username: string): DevPayrollRun
}

let providerPromise: Promise<PayrollProvider> | null = null

function getProvider(): Promise<PayrollProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/hr/services/PayrollService')
      const svc = new mod.PayrollService()
      return {
        getAllRuns: () => svc.findAllRuns().map(r => r as unknown as DevPayrollRun),
        getRunById: (id) => svc.findRunById(id) as unknown as DevPayrollRun | null ?? undefined,
        createRun: (periodId, notes) => { const r = svc.createRun(periodId, notes); return r as unknown as DevPayrollRun },
        calculateRun: (runId) => { const r = svc.calculateRun(runId); return r as unknown as DevPayrollRun },
        reviewRun: (runId) => { const r = svc.reviewRun(runId); return r as unknown as DevPayrollRun },
        approveRun: (runId, username) => { const r = svc.approveRun(runId, username, username); return r as unknown as DevPayrollRun },
        finalizeRun: (runId, username) => { const r = svc.finalizeRun(runId, username, username); return r as unknown as DevPayrollRun },
        reverseRun: (runId, reason, username) => { const r = svc.reverseRun(runId, reason, username, username); return r as unknown as DevPayrollRun },
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): PayrollProvider {
  const RUN_KEY = 'erp_dev_payroll_runs'
  const loadRuns = (): DevPayrollRun[] => { try { return JSON.parse(localStorage.getItem(RUN_KEY) ?? '[]') } catch { return [] } }
  const saveRuns = (d: DevPayrollRun[]) => localStorage.setItem(RUN_KEY, JSON.stringify(d))
  const genId = () => Math.random().toString(36).substring(2, 15)
  const now = () => new Date().toISOString()

  return {
    getAllRuns: () => loadRuns().filter(r => !r.isDeleted),
    getRunById: (id) => loadRuns().find(r => r._id === id),
    createRun: (periodId, notes) => {
      const runs = loadRuns()
      const existing = runs.filter(r => r.periodId === periodId)
      const run: DevPayrollRun = {
        _id: genId(), periodId, runNumber: existing.length + 1, status: 'draft',
        totalGross: 0, totalDeductions: 0, totalNet: 0, employeeCount: 0,
        approvedBy: null, approvedAt: null, finalizedBy: null, finalizedAt: null,
        reversedBy: null, reversedAt: null, reversalOfId: null,
        notes: notes || null, isDeleted: false, deletedAt: null, createdAt: now(), updatedAt: now(),
      }
      runs.push(run); saveRuns(runs); return run
    },
    calculateRun: (runId) => {
      const runs = loadRuns(); const idx = runs.findIndex(r => r._id === runId)
      if (idx === -1) throw new Error('Run not found')
      runs[idx] = { ...runs[idx], status: 'calculated', totalGross: 0, totalDeductions: 0, totalNet: 0, employeeCount: 0, updatedAt: now() } as DevPayrollRun
      saveRuns(runs); return runs[idx]
    },
    reviewRun: (runId) => {
      const runs = loadRuns(); const idx = runs.findIndex(r => r._id === runId)
      if (idx === -1) throw new Error('Run not found')
      runs[idx] = { ...runs[idx], status: 'reviewing', updatedAt: now() } as DevPayrollRun
      saveRuns(runs); return runs[idx]
    },
    approveRun: (runId, username) => {
      const runs = loadRuns(); const idx = runs.findIndex(r => r._id === runId)
      if (idx === -1) throw new Error('Run not found')
      runs[idx] = { ...runs[idx], status: 'approved', approvedBy: username, approvedAt: now(), updatedAt: now() } as DevPayrollRun
      saveRuns(runs); return runs[idx]
    },
    finalizeRun: (runId, username) => {
      const runs = loadRuns(); const idx = runs.findIndex(r => r._id === runId)
      if (idx === -1) throw new Error('Run not found')
      runs[idx] = { ...runs[idx], status: 'finalized', finalizedBy: username, finalizedAt: now(), updatedAt: now() } as DevPayrollRun
      saveRuns(runs); return runs[idx]
    },
    reverseRun: (runId, reason, username) => {
      const runs = loadRuns(); const orig = runs.find(r => r._id === runId)
      if (!orig) throw new Error('Run not found')
      orig.status = 'reversed'; orig.reversedBy = username; orig.reversedAt = now(); orig.updatedAt = now()
      saveRuns(runs)
      const newRun: DevPayrollRun = {
        _id: genId(), periodId: orig.periodId, runNumber: runs.length + 1, status: 'finalized',
        totalGross: -orig.totalGross, totalDeductions: -orig.totalDeductions, totalNet: -orig.totalNet,
        employeeCount: orig.employeeCount, approvedBy: null, approvedAt: null,
        finalizedBy: username, finalizedAt: now(), reversedBy: null, reversedAt: null,
        reversalOfId: runId, notes: `Reversal of run #${orig.runNumber}. Reason: ${reason}`,
        isDeleted: false, deletedAt: null, createdAt: now(), updatedAt: now(),
      }
      runs.push(newRun); saveRuns(runs); return newRun
    },
  }
}

export interface UsePayrollRunsResult {
  runs: DevPayrollRun[]
  loading: boolean
  error: string | null
  refresh: () => void
  createRun: (periodId: string, notes?: string) => void
  calculateRun: (runId: string) => void
  reviewRun: (runId: string) => void
  approveRun: (runId: string, username: string) => void
  finalizeRun: (runId: string, username: string) => void
  reverseRun: (runId: string, reason: string, username: string) => void
}

export function usePayrollRuns(): UsePayrollRunsResult {
  const [runs, setRuns] = useState<DevPayrollRun[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => { if (active) { setRuns(p.getAllRuns()); setError(null) } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Unknown error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  const createRun = useCallback((periodId: string, notes?: string) => {
    getProvider().then((svc) => { svc.createRun(periodId, notes); refresh() })
  }, [refresh])

  const calculateRun = useCallback((runId: string) => {
    getProvider().then((svc) => { svc.calculateRun(runId); refresh() })
  }, [refresh])

  const reviewRun = useCallback((runId: string) => {
    getProvider().then((svc) => { svc.reviewRun(runId); refresh() })
  }, [refresh])

  const approveRun = useCallback((runId: string, username: string) => {
    getProvider().then((svc) => { svc.approveRun(runId, username); refresh() })
  }, [refresh])

  const finalizeRun = useCallback((runId: string, username: string) => {
    getProvider().then((svc) => { svc.finalizeRun(runId, username); refresh() })
  }, [refresh])

  const reverseRun = useCallback((runId: string, reason: string, username: string) => {
    getProvider().then((svc) => { svc.reverseRun(runId, reason, username); refresh() })
  }, [refresh])

  return {
    runs, loading, error, refresh,
    createRun, calculateRun, reviewRun, approveRun, finalizeRun, reverseRun,
  }
}
