export const TaskStatus = {
  Todo: 'todo',
  InProgress: 'in_progress',
  InReview: 'in_review',
  Done: 'done',
  Cancelled: 'cancelled',
} as const

export type TaskStatusValue = (typeof TaskStatus)[keyof typeof TaskStatus]

export const TaskPriority = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
  Critical: 'critical',
} as const

export type TaskPriorityValue = (typeof TaskPriority)[keyof typeof TaskPriority]
