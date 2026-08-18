export const ProjectBudgetStatus = {
  Active: 'active',
  Exhausted: 'exhausted',
  Closed: 'closed',
} as const

export type ProjectBudgetStatusValue = (typeof ProjectBudgetStatus)[keyof typeof ProjectBudgetStatus]
