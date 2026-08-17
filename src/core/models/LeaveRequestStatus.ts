export const LeaveRequestStatus = {
  Draft: 'draft',
  PendingManager: 'pending_manager',
  PendingHr: 'pending_hr',
  Approved: 'approved',
  Rejected: 'rejected',
  Cancelled: 'cancelled',
} as const

export type LeaveRequestStatusValue = (typeof LeaveRequestStatus)[keyof typeof LeaveRequestStatus]
