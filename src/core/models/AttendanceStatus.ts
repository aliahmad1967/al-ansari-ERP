export const AttendanceStatus = {
  Present: 'present',
  Absent: 'absent',
  Late: 'late',
  EarlyDeparture: 'early_departure',
  HalfDay: 'half_day',
  OnLeave: 'on_leave',
  Holiday: 'holiday',
} as const

export type AttendanceStatusValue = (typeof AttendanceStatus)[keyof typeof AttendanceStatus]

export const CheckInOutSource = {
  Manual: 'manual',
  Biometric: 'biometric',
  Mobile: 'mobile',
  Web: 'web',
} as const

export type CheckInOutSourceValue = (typeof CheckInOutSource)[keyof typeof CheckInOutSource]
