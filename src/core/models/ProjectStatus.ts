export const ProjectStatus = {
  Planning: 'planning',
  Active: 'active',
  OnHold: 'on_hold',
  Completed: 'completed',
  Cancelled: 'cancelled',
} as const

export type ProjectStatusValue = (typeof ProjectStatus)[keyof typeof ProjectStatus]

export const ProjectPriority = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
  Critical: 'critical',
} as const

export type ProjectPriorityValue = (typeof ProjectPriority)[keyof typeof ProjectPriority]
