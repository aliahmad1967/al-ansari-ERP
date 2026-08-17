import { useCallback, useEffect, useState } from 'react'

type Input = Record<string, unknown>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>

interface AttendanceProvider {
  getAttendance(): Row[]
  getAttendanceByEmployee(id: string): Row[]
  getAttendanceByMonth(y: number, m: number): Row[]
  checkIn(empId: string, src?: string): Row | null
  checkOut(empId: string): Row | null
  getShifts(): Row[]
  createShift(input: Input): Row
  getLeaveTypes(): Row[]
  createLeaveType(input: Input): Row
  getLeaveBalances(empId?: string): Row[]
  getLeaveRequests(empId?: string): Row[]
  createLeaveRequest(input: Input): Row
  approveLeaveRequest(id: string, level: string, userId: string, username: string, comment?: string): void
  rejectLeaveRequest(id: string, level: string, userId: string, username: string, reason: string): void
  cancelLeaveRequest(id: string): void
  getLeaveApprovals(id: string): Row[]
}

let providerPromise: Promise<AttendanceProvider> | null = null

function getProvider(): Promise<AttendanceProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async (): Promise<AttendanceProvider> => {
    try {
      const mod = await import('@/modules/attendance/services/AttendanceService')
      const attSvc = new mod.AttendanceService()
      const leaveMod = await import('@/modules/attendance/services/LeaveService')
      const leaveSvc = new leaveMod.LeaveService()
      return {
        getAttendance: () => attSvc.findAllRecords().map(r => ({ ...r } as Row)),
        getAttendanceByEmployee: (id) => attSvc.findRecordsByEmployee(id).map(r => ({ ...r } as Row)),
        getAttendanceByMonth: (y, m) => attSvc.findRecordsByMonth(y, m).map(r => ({ ...r } as Row)),
        checkIn: (empId, src) => { const r = attSvc.checkIn(empId, src); return r ? { ...r } as Row : null },
        checkOut: (empId) => { const r = attSvc.checkOut(empId); return r ? { ...r } as Row : null },
        getShifts: () => attSvc.findAllShifts().map(s => ({ ...s } as Row)),
        createShift: (input) => ({ ...attSvc.createShift(input as never) } as Row),
        getLeaveTypes: () => leaveSvc.findActiveTypes().map(t => ({ ...t } as Row)),
        createLeaveType: (input) => ({ ...leaveSvc.createType(input as never) } as Row),
        getLeaveBalances: (empId) => empId ? leaveSvc.findBalances(empId).map(b => ({ ...b } as Row)) : [],
        getLeaveRequests: (empId) => empId ? leaveSvc.findRequestsByEmployee(empId).map(r => ({ ...r } as Row)) : leaveSvc.findAllRequests().map(r => ({ ...r } as Row)),
        createLeaveRequest: (input) => ({ ...leaveSvc.createRequest(input as never) } as Row),
        approveLeaveRequest: (id, level, userId, username, comment) => { leaveSvc.approveRequest(id, level as never, userId, username, comment) },
        rejectLeaveRequest: (id, level, userId, username, reason) => { leaveSvc.rejectRequest(id, level as never, userId, username, reason) },
        cancelLeaveRequest: (id) => { leaveSvc.cancelRequest(id) },
        getLeaveApprovals: (id) => leaveSvc.findApprovals(id).map(a => ({ ...a } as Row)),
      }
    } catch {
      const { devAttendanceService } = await import('@/core/services/DevAttendanceService')
      return {
        getAttendance: () => devAttendanceService.getAttendance() as Row[],
        getAttendanceByEmployee: (id) => devAttendanceService.getAttendanceByEmployee(id) as Row[],
        getAttendanceByMonth: (y, m) => devAttendanceService.getAttendanceByMonth(y, m) as Row[],
        checkIn: (empId, src) => devAttendanceService.checkIn(empId, src as string) as Row | null,
        checkOut: (empId) => devAttendanceService.checkOut(empId) as Row | null,
        getShifts: () => devAttendanceService.getShifts() as Row[],
        createShift: (input) => devAttendanceService.createShift(input) as Row,
        getLeaveTypes: () => devAttendanceService.getLeaveTypes() as Row[],
        createLeaveType: (input) => devAttendanceService.createLeaveType(input) as Row,
        getLeaveBalances: (empId) => devAttendanceService.getLeaveBalances(empId as string) as Row[],
        getLeaveRequests: (empId) => devAttendanceService.getLeaveRequests(empId as string) as Row[],
        createLeaveRequest: (input) => devAttendanceService.createLeaveRequest(input) as Row,
        approveLeaveRequest: (id, level, userId, username, comment) => { devAttendanceService.approveLeaveRequest(id, level, userId, username, comment) },
        rejectLeaveRequest: (id, level, userId, username, reason) => { devAttendanceService.rejectLeaveRequest(id, level, userId, username, reason) },
        cancelLeaveRequest: (id) => { devAttendanceService.cancelLeaveRequest(id) },
        getLeaveApprovals: (id) => devAttendanceService.getLeaveApprovals(id) as Row[],
      }
    }
  })()
  return providerPromise
}

export interface UseAttendanceResult {
  attendance: Row[]
  shifts: Row[]
  loading: boolean
  error: string | null
  refresh: () => void
  checkIn: (employeeId: string, source?: string) => void
  checkOut: (employeeId: string) => void
}

export function useAttendance(): UseAttendanceResult {
  const [attendance, setAttendance] = useState<Row[]>([])
  const [shifts, setShifts] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => {
        if (active) {
          setAttendance(p.getAttendance())
          setShifts(p.getShifts())
          setError(null)
        }
      })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey])

  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])
  const checkIn = useCallback((empId: string, src?: string) => { getProvider().then(p => { p.checkIn(empId, src); refresh() }) }, [refresh])
  const checkOut = useCallback((empId: string) => { getProvider().then(p => { p.checkOut(empId); refresh() }) }, [refresh])

  return { attendance, shifts, loading, error, refresh, checkIn, checkOut }
}

export interface UseLeaveResult {
  types: Row[]
  requests: Row[]
  balances: Row[]
  approvals: Row[]
  loading: boolean
  error: string | null
  refresh: () => void
  createRequest: (input: Input) => void
  approveRequest: (id: string, level: string, userId: string, username: string, comment?: string) => void
  rejectRequest: (id: string, level: string, userId: string, username: string, reason: string) => void
  cancelRequest: (id: string) => void
  getApprovals: (id: string) => void
}

export function useLeave(employeeId?: string): UseLeaveResult {
  const [types, setTypes] = useState<Row[]>([])
  const [requests, setRequests] = useState<Row[]>([])
  const [balances, setBalances] = useState<Row[]>([])
  const [approvals, setApprovals] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    getProvider()
      .then((p) => {
        if (active) {
          setTypes(p.getLeaveTypes())
          setRequests(p.getLeaveRequests(employeeId))
          setBalances(p.getLeaveBalances(employeeId))
          setError(null)
        }
      })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshKey, employeeId])

  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])
  const createRequest = useCallback((input: Input) => { getProvider().then(p => { p.createLeaveRequest(input); refresh() }) }, [refresh])
  const approveRequest = useCallback((id: string, level: string, userId: string, username: string, comment?: string) => { getProvider().then(p => { p.approveLeaveRequest(id, level, userId, username, comment); refresh() }) }, [refresh])
  const rejectRequest = useCallback((id: string, level: string, userId: string, username: string, reason: string) => { getProvider().then(p => { p.rejectLeaveRequest(id, level, userId, username, reason); refresh() }) }, [refresh])
  const cancelRequest = useCallback((id: string) => { getProvider().then(p => { p.cancelLeaveRequest(id); refresh() }) }, [refresh])
  const getApprovals = useCallback((id: string) => { getProvider().then(p => { setApprovals(p.getLeaveApprovals(id)) }) }, [])

  return { types, requests, balances, approvals, loading, error, refresh, createRequest, approveRequest, rejectRequest, cancelRequest, getApprovals }
}
