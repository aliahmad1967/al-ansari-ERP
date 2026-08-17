export const ApprovalLevel = {
  Manager: 'manager',
  Hr: 'hr',
} as const

export type ApprovalLevelValue = (typeof ApprovalLevel)[keyof typeof ApprovalLevel]

export const ApprovalAction = {
  Approve: 'approve',
  Reject: 'reject',
} as const

export type ApprovalActionValue = (typeof ApprovalAction)[keyof typeof ApprovalAction]
