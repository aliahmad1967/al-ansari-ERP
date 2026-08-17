export const ContractType = {
  FullTime: 'full-time',
  PartTime: 'part-time',
  Contract: 'contract',
  Internship: 'internship',
} as const

export type ContractTypeValue = (typeof ContractType)[keyof typeof ContractType]
