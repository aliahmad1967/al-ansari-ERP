export const MilestoneStatus = {
  Pending: 'pending',
  InProgress: 'in_progress',
  Achieved: 'achieved',
  Missed: 'missed',
} as const

export type MilestoneStatusValue = (typeof MilestoneStatus)[keyof typeof MilestoneStatus]
