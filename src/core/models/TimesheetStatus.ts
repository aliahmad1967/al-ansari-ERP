export const TimesheetStatus = {
  Draft: 'draft',
  Submitted: 'submitted',
  Approved: 'approved',
  Rejected: 'rejected',
} as const

export type TimesheetStatusValue = (typeof TimesheetStatus)[keyof typeof TimesheetStatus]
