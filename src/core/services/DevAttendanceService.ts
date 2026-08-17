/**
 * DevAttendanceService — browser-compatible attendance & leave services using localStorage.
 */

const DEV_STORAGE_KEY = 'erp_dev_attendance_data'

interface DevAttendanceRecord {
  _id: string
  employeeId: string
  date: string
  checkIn: string | null
  checkOut: string | null
  scheduledCheckIn: string | null
  scheduledCheckOut: string | null
  workingHours: number
  overtimeMinutes: number
  status: string
  checkInSource: string | null
  checkOutSource: string | null
  lateMinutes: number
  earlyDepartureMinutes: number
  breakMinutes: number
  notes: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

interface DevShift {
  _id: string
  name: string
  nameAr: string | null
  startTime: string
  endTime: string
  breakMinutes: number
  isActive: boolean
  notes: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

interface DevLeaveType {
  _id: string
  name: string
  nameAr: string | null
  daysPerYear: number
  isPaid: boolean
  isCarryOver: boolean
  maxCarryOverDays: number
  isActive: boolean
  color: string | null
  notes: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

interface DevLeaveBalance {
  _id: string
  employeeId: string
  leaveTypeId: string
  year: number
  totalDays: number
  usedDays: number
  carriedOverDays: number
  notes: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

interface DevLeaveRequest {
  _id: string
  employeeId: string
  leaveTypeId: string
  startDate: string
  endDate: string
  totalDays: number
  reason: string | null
  status: string
  rejectionReason: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

interface DevLeaveApproval {
  _id: string
  leaveRequestId: string
  level: string
  action: string
  approverUserId: string
  approverUsername: string | null
  comment: string | null
  createdAt: string
}

interface DevAttendanceData {
  attendance: DevAttendanceRecord[]
  shifts: DevShift[]
  leaveTypes: DevLeaveType[]
  leaveBalances: DevLeaveBalance[]
  leaveRequests: DevLeaveRequest[]
  leaveApprovals: DevLeaveApproval[]
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

function now(): string {
  return new Date().toISOString()
}

function dateStr(d: Date): string {
  return d.toISOString().split('T')[0]!
}

function loadData(): DevAttendanceData {
  try {
    const raw = localStorage.getItem(DEV_STORAGE_KEY)
    if (raw) return JSON.parse(raw) as DevAttendanceData
  } catch { /* ignore */ }
  return seedData()
}

function saveData(data: DevAttendanceData): void {
  try {
    localStorage.setItem(DEV_STORAGE_KEY, JSON.stringify(data))
  } catch { /* ignore */ }
}

function seedData(): DevAttendanceData {
  const empIds = Array.from({ length: 15 }, () => generateId())

  const shifts: DevShift[] = [
    { _id: generateId(), name: 'Morning', nameAr: 'صباحي', startTime: '08:00', endTime: '17:00', breakMinutes: 60, isActive: true, notes: null, isDeleted: false, deletedAt: null, createdAt: now(), updatedAt: now() },
    { _id: generateId(), name: 'Evening', nameAr: 'مسائي', startTime: '14:00', endTime: '23:00', breakMinutes: 60, isActive: true, notes: null, isDeleted: false, deletedAt: null, createdAt: now(), updatedAt: now() },
    { _id: generateId(), name: 'Night', nameAr: 'ليلي', startTime: '22:00', endTime: '07:00', breakMinutes: 60, isActive: true, notes: null, isDeleted: false, deletedAt: null, createdAt: now(), updatedAt: now() },
  ]

  const leaveTypes: DevLeaveType[] = [
    { _id: generateId(), name: 'Annual Leave', nameAr: 'إجازة سنوية', daysPerYear: 30, isPaid: true, isCarryOver: true, maxCarryOverDays: 5, isActive: true, color: '#3b82f6', notes: null, isDeleted: false, deletedAt: null, createdAt: now(), updatedAt: now() },
    { _id: generateId(), name: 'Sick Leave', nameAr: 'إجازة مرضية', daysPerYear: 30, isPaid: true, isCarryOver: false, maxCarryOverDays: 0, isActive: true, color: '#ef4444', notes: null, isDeleted: false, deletedAt: null, createdAt: now(), updatedAt: now() },
    { _id: generateId(), name: 'Casual Leave', nameAr: 'إجازة عارضة', daysPerYear: 7, isPaid: true, isCarryOver: false, maxCarryOverDays: 0, isActive: true, color: '#f59e0b', notes: null, isDeleted: false, deletedAt: null, createdAt: now(), updatedAt: now() },
    { _id: generateId(), name: 'Maternity Leave', nameAr: 'إجازة أمومة', daysPerYear: 60, isPaid: true, isCarryOver: false, maxCarryOverDays: 0, isActive: true, color: '#8b5cf6', notes: null, isDeleted: false, deletedAt: null, createdAt: now(), updatedAt: now() },
    { _id: generateId(), name: 'Unpaid Leave', nameAr: 'إجازة بدون راتب', daysPerYear: 30, isPaid: false, isCarryOver: false, maxCarryOverDays: 0, isActive: true, color: '#6b7280', notes: null, isDeleted: false, deletedAt: null, createdAt: now(), updatedAt: now() },
  ]

  const annualLeaveType = leaveTypes[0]!
  const sickLeaveType = leaveTypes[1]!
  const casualLeaveType = leaveTypes[2]!

  const attendance: DevAttendanceRecord[] = []
  const today = new Date()

  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const d = new Date(today)
    d.setDate(d.getDate() - dayOffset)
    const dayOfWeek = d.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 5) continue

    for (let empIdx = 0; empIdx < 14; empIdx++) {
      const empId = empIds[empIdx]!
      const isLate = Math.random() < 0.15
      const isAbsent = Math.random() < 0.05
      const hasEarlyDeparture = !isLate && !isAbsent && Math.random() < 0.08
      const hasOvertime = !isAbsent && !hasEarlyDeparture && Math.random() < 0.12

      const checkInHour = isLate ? 8 + Math.floor(Math.random() * 2) : 7 + Math.floor(Math.random() * 60) / 60
      const checkIn = new Date(d)
      checkIn.setHours(Math.floor(checkInHour), Math.round((checkInHour % 1) * 60), 0, 0)

      const checkOutHour = hasEarlyDeparture ? 14 + Math.random() * 2 : 16 + Math.random() * 2
      const checkOut = new Date(d)
      checkOut.setHours(Math.floor(checkOutHour), Math.round((checkOutHour % 1) * 60), 0, 0)

      const workMs = checkOut.getTime() - checkIn.getTime() - 60 * 60 * 1000
      const workingHours = isAbsent ? 0 : Math.max(0, Math.round((workMs / (1000 * 60 * 60)) * 10) / 10)
      const lateMinutes = isLate ? Math.floor(Math.random() * 45) + 5 : 0
      const earlyDepartureMinutes = hasEarlyDeparture ? Math.floor(Math.random() * 120) + 30 : 0
      const overtimeMinutes = hasOvertime ? Math.floor(Math.random() * 120) + 30 : 0

      let status = 'present'
      if (isAbsent) status = 'absent'
      else if (isLate) status = 'late'
      else if (hasEarlyDeparture) status = 'early_departure'
      else if (workingHours < 5) status = 'half_day'

      attendance.push({
        _id: generateId(),
        employeeId: empId,
        date: dateStr(d),
        checkIn: isAbsent ? null : checkIn.toISOString(),
        checkOut: isAbsent ? null : checkOut.toISOString(),
        scheduledCheckIn: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 8, 0).toISOString(),
        scheduledCheckOut: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 17, 0).toISOString(),
        workingHours,
        overtimeMinutes,
        status,
        checkInSource: isAbsent ? null : 'biometric',
        checkOutSource: isAbsent ? null : 'biometric',
        lateMinutes,
        earlyDepartureMinutes,
        breakMinutes: 60,
        notes: null,
        isDeleted: false,
        deletedAt: null,
        createdAt: now(),
        updatedAt: now(),
      })
    }
  }

  const leaveBalances: DevLeaveBalance[] = []
  const leaveRequests: DevLeaveRequest[] = []
  const leaveApprovals: DevLeaveApproval[] = []

  for (let i = 0; i < 14; i++) {
    const empId = empIds[i]!
    const usedAnnual = Math.floor(Math.random() * 15)
    const usedSick = Math.floor(Math.random() * 5)
    const usedCasual = Math.floor(Math.random() * 3)

    leaveBalances.push(
      { _id: generateId(), employeeId: empId, leaveTypeId: annualLeaveType._id, year: 2026, totalDays: 30, usedDays: usedAnnual, carriedOverDays: 3, notes: null, isDeleted: false, deletedAt: null, createdAt: now(), updatedAt: now() },
      { _id: generateId(), employeeId: empId, leaveTypeId: sickLeaveType._id, year: 2026, totalDays: 30, usedDays: usedSick, carriedOverDays: 0, notes: null, isDeleted: false, deletedAt: null, createdAt: now(), updatedAt: now() },
      { _id: generateId(), employeeId: empId, leaveTypeId: casualLeaveType._id, year: 2026, totalDays: 7, usedDays: usedCasual, carriedOverDays: 0, notes: null, isDeleted: false, deletedAt: null, createdAt: now(), updatedAt: now() },
    )

    if (usedAnnual > 0) {
      const reqId = generateId()
      const startD = new Date(2026, 0, 5 + i * 2)
      const endD = new Date(startD)
      endD.setDate(endD.getDate() + Math.min(usedAnnual, 3) - 1)
      leaveRequests.push({
        _id: reqId,
        employeeId: empId,
        leaveTypeId: annualLeaveType._id,
        startDate: dateStr(startD),
        endDate: dateStr(endD),
        totalDays: Math.min(usedAnnual, 3),
        reason: 'Family vacation',
        status: 'approved',
        rejectionReason: null,
        isDeleted: false,
        deletedAt: null,
        createdAt: startD.toISOString(),
        updatedAt: now(),
      })
      leaveApprovals.push(
        { _id: generateId(), leaveRequestId: reqId, level: 'manager', action: 'approve', approverUserId: empIds[4]!, approverUsername: 'Mohammed Saleh', comment: 'Approved', createdAt: startD.toISOString() },
        { _id: generateId(), leaveRequestId: reqId, level: 'hr', action: 'approve', approverUserId: empIds[1]!, approverUsername: 'Sara Ali', comment: 'Approved', createdAt: new Date(startD.getTime() + 86400000).toISOString() },
      )
    }
  }

  const pendingReqId = generateId()
  leaveRequests.push({
    _id: pendingReqId,
    employeeId: empIds[2]!,
    leaveTypeId: annualLeaveType._id,
    startDate: dateStr(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5)),
    endDate: dateStr(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)),
    totalDays: 3,
    reason: 'Personal trip',
    status: 'pending_manager',
    rejectionReason: null,
    isDeleted: false,
    deletedAt: null,
    createdAt: now(),
    updatedAt: now(),
  })

  const pendingReqId2 = generateId()
  leaveRequests.push({
    _id: pendingReqId2,
    employeeId: empIds[3]!,
    leaveTypeId: sickLeaveType._id,
    startDate: dateStr(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)),
    endDate: dateStr(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2)),
    totalDays: 2,
    reason: 'Medical appointment',
    status: 'pending_hr',
    rejectionReason: null,
    isDeleted: false,
    deletedAt: null,
    createdAt: now(),
    updatedAt: now(),
  })
  leaveApprovals.push({
    _id: generateId(),
    leaveRequestId: pendingReqId2,
    level: 'manager',
    action: 'approve',
    approverUserId: empIds[4]!,
    approverUsername: 'Mohammed Saleh',
    comment: 'Approved - medical',
    createdAt: now(),
  })

  const data: DevAttendanceData = { attendance, shifts, leaveTypes, leaveBalances, leaveRequests, leaveApprovals }
  saveData(data)
  return data
}

class DevAttendanceServiceClass {
  getAttendance(): DevAttendanceRecord[] {
    return loadData().attendance.filter(r => !r.isDeleted)
  }

  getAttendanceByEmployee(employeeId: string): DevAttendanceRecord[] {
    return loadData().attendance.filter(r => r.employeeId === employeeId && !r.isDeleted)
  }

  getAttendanceByDate(date: string): DevAttendanceRecord[] {
    return loadData().attendance.filter(r => r.date === date && !r.isDeleted)
  }

  getAttendanceByMonth(year: number, month: number): DevAttendanceRecord[] {
    const prefix = `${year}-${String(month).padStart(2, '0')}`
    return loadData().attendance.filter(r => r.date.startsWith(prefix) && !r.isDeleted)
  }

  checkIn(employeeId: string, source: string = 'manual'): DevAttendanceRecord {
    const data = loadData()
    const today = dateStr(new Date())
    const existing = data.attendance.find(r => r.employeeId === employeeId && r.date === today)
    if (existing) {
      existing.checkIn = new Date().toISOString()
      existing.checkInSource = source
      existing.status = 'present'
      existing.updatedAt = now()
      saveData(data)
      return existing
    }
    const record: DevAttendanceRecord = {
      _id: generateId(),
      employeeId,
      date: today,
      checkIn: new Date().toISOString(),
      checkOut: null,
      scheduledCheckIn: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
      scheduledCheckOut: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(),
      workingHours: 0,
      overtimeMinutes: 0,
      status: 'present',
      checkInSource: source,
      checkOutSource: null,
      lateMinutes: 0,
      earlyDepartureMinutes: 0,
      breakMinutes: 60,
      notes: null,
      isDeleted: false,
      deletedAt: null,
      createdAt: now(),
      updatedAt: now(),
    }
    data.attendance.push(record)
    saveData(data)
    return record
  }

  checkOut(employeeId: string, source: string = 'manual'): DevAttendanceRecord | null {
    const data = loadData()
    const today = dateStr(new Date())
    const record = data.attendance.find(r => r.employeeId === employeeId && r.date === today)
    if (!record) return null
    const checkOutTime = new Date()
    record.checkOut = checkOutTime.toISOString()
    record.checkOutSource = source
    if (record.checkIn) {
      const checkInTime = new Date(record.checkIn)
      const workMs = checkOutTime.getTime() - checkInTime.getTime() - record.breakMinutes * 60 * 1000
      record.workingHours = Math.max(0, Math.round((workMs / (1000 * 60 * 60)) * 10) / 10)
    }
    record.updatedAt = now()
    saveData(data)
    return record
  }

  getShifts(): DevShift[] {
    return loadData().shifts.filter(s => !s.isDeleted)
  }

  createShift(input: Record<string, unknown>): DevShift {
    const data = loadData()
    const shift: DevShift = {
      _id: generateId(),
      name: (input.name as string) || '',
      nameAr: (input.nameAr as string) || null,
      startTime: (input.startTime as string) || '08:00',
      endTime: (input.endTime as string) || '17:00',
      breakMinutes: (input.breakMinutes as number) ?? 60,
      isActive: (input.isActive as boolean) ?? true,
      notes: (input.notes as string) || null,
      isDeleted: false,
      deletedAt: null,
      createdAt: now(),
      updatedAt: now(),
    }
    data.shifts.push(shift)
    saveData(data)
    return shift
  }

  getLeaveTypes(): DevLeaveType[] {
    return loadData().leaveTypes.filter(t => !t.isDeleted)
  }

  createLeaveType(input: Record<string, unknown>): DevLeaveType {
    const data = loadData()
    const lt: DevLeaveType = {
      _id: generateId(),
      name: (input.name as string) || '',
      nameAr: (input.nameAr as string) || null,
      daysPerYear: (input.daysPerYear as number) ?? 30,
      isPaid: (input.isPaid as boolean) ?? true,
      isCarryOver: (input.isCarryOver as boolean) ?? false,
      maxCarryOverDays: (input.maxCarryOverDays as number) ?? 0,
      isActive: (input.isActive as boolean) ?? true,
      color: (input.color as string) || null,
      notes: (input.notes as string) || null,
      isDeleted: false,
      deletedAt: null,
      createdAt: now(),
      updatedAt: now(),
    }
    data.leaveTypes.push(lt)
    saveData(data)
    return lt
  }

  getLeaveBalances(employeeId?: string): DevLeaveBalance[] {
    const balances = loadData().leaveBalances.filter(b => !b.isDeleted)
    if (employeeId) return balances.filter(b => b.employeeId === employeeId)
    return balances
  }

  getLeaveRequests(employeeId?: string): DevLeaveRequest[] {
    const requests = loadData().leaveRequests.filter(r => !r.isDeleted)
    if (employeeId) return requests.filter(r => r.employeeId === employeeId)
    return requests
  }

  createLeaveRequest(input: Record<string, unknown>): DevLeaveRequest {
    const data = loadData()
    const req: DevLeaveRequest = {
      _id: generateId(),
      employeeId: (input.employeeId as string) || '',
      leaveTypeId: (input.leaveTypeId as string) || '',
      startDate: (input.startDate as string) || dateStr(new Date()),
      endDate: (input.endDate as string) || dateStr(new Date()),
      totalDays: (input.totalDays as number) || 1,
      reason: (input.reason as string) || null,
      status: 'pending_manager',
      rejectionReason: null,
      isDeleted: false,
      deletedAt: null,
      createdAt: now(),
      updatedAt: now(),
    }
    data.leaveRequests.push(req)
    saveData(data)
    return req
  }

  approveLeaveRequest(requestId: string, level: string, approverUserId: string, approverUsername: string, comment?: string): DevLeaveRequest | null {
    const data = loadData()
    const req = data.leaveRequests.find(r => r._id === requestId)
    if (!req) return null

    data.leaveApprovals.push({
      _id: generateId(),
      leaveRequestId: requestId,
      level,
      action: 'approve',
      approverUserId,
      approverUsername,
      comment: comment ?? 'Approved',
      createdAt: now(),
    })

    if (level === 'manager') {
      req.status = 'pending_hr'
    } else {
      req.status = 'approved'
      const balance = data.leaveBalances.find(b => b.employeeId === req.employeeId && b.leaveTypeId === req.leaveTypeId && b.year === new Date(req.startDate).getFullYear())
      if (balance) balance.usedDays += req.totalDays
    }
    req.updatedAt = now()
    saveData(data)
    return req
  }

  rejectLeaveRequest(requestId: string, level: string, approverUserId: string, approverUsername: string, reason: string): DevLeaveRequest | null {
    const data = loadData()
    const req = data.leaveRequests.find(r => r._id === requestId)
    if (!req) return null

    data.leaveApprovals.push({
      _id: generateId(),
      leaveRequestId: requestId,
      level,
      action: 'reject',
      approverUserId,
      approverUsername,
      comment: reason,
      createdAt: now(),
    })

    req.status = 'rejected'
    req.rejectionReason = reason
    req.updatedAt = now()
    saveData(data)
    return req
  }

  cancelLeaveRequest(requestId: string): DevLeaveRequest | null {
    const data = loadData()
    const req = data.leaveRequests.find(r => r._id === requestId)
    if (!req || req.status === 'approved') return null
    req.status = 'cancelled'
    req.updatedAt = now()
    saveData(data)
    return req
  }

  getLeaveApprovals(requestId: string): DevLeaveApproval[] {
    return loadData().leaveApprovals.filter(a => a.leaveRequestId === requestId)
  }
}

export const devAttendanceService = new DevAttendanceServiceClass()
export type { DevAttendanceRecord, DevShift, DevLeaveType, DevLeaveBalance, DevLeaveRequest, DevLeaveApproval }
