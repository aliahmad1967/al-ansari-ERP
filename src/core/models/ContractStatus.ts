export const ContractStatus = {
  Active: 'active',
  Expired: 'expired',
  Terminated: 'terminated',
} as const

export type ContractStatusValue = (typeof ContractStatus)[keyof typeof ContractStatus]
