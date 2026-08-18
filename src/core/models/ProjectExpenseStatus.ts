export const ProjectExpenseStatus = {
  Pending: 'pending',
  Approved: 'approved',
  Rejected: 'rejected',
  Reimbursed: 'reimbursed',
} as const

export type ProjectExpenseStatusValue = (typeof ProjectExpenseStatus)[keyof typeof ProjectExpenseStatus]

export const ProjectExpenseCategory = {
  Labor: 'labor',
  Materials: 'materials',
  Travel: 'travel',
  Equipment: 'equipment',
  Subcontractor: 'subcontractor',
  Software: 'software',
  Other: 'other',
} as const

export type ProjectExpenseCategoryValue = (typeof ProjectExpenseCategory)[keyof typeof ProjectExpenseCategory]
