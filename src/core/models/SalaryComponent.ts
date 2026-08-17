import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const SalaryComponentType = {
  Earning: 'earning',
  Deduction: 'deduction',
  Benefit: 'benefit',
} as const

export type SalaryComponentTypeValue = (typeof SalaryComponentType)[keyof typeof SalaryComponentType]

export const SalaryComponentCalculation = {
  Fixed: 'fixed',
  Percentage: 'percentage',
} as const

export type SalaryComponentCalculationValue =
  (typeof SalaryComponentCalculation)[keyof typeof SalaryComponentCalculation]

export const SalaryComponentPercentageBase = {
  BasicOnly: 'basic_only',
  TotalEarnings: 'total_earnings',
  Gross: 'gross',
} as const

export type SalaryComponentPercentageBaseValue =
  (typeof SalaryComponentPercentageBase)[keyof typeof SalaryComponentPercentageBase]

export interface SalaryComponentInput {
  structureId: string
  code: string
  name: string
  nameAr?: string
  type: SalaryComponentTypeValue
  calculationType: SalaryComponentCalculationValue
  defaultValue: number
  percentageOf?: SalaryComponentPercentageBaseValue
  sortOrder?: number
  isStatutory?: boolean
  isActive?: boolean
}

export class SalaryComponent extends Realm.Object<SalaryComponent> {
  declare _id: string
  declare structureId: string
  declare code: string
  declare name: string
  declare nameAr: string | null
  declare type: SalaryComponentTypeValue
  declare calculationType: SalaryComponentCalculationValue
  declare defaultValue: number
  declare percentageOf: SalaryComponentPercentageBaseValue
  declare sortOrder: number
  declare isStatutory: boolean
  declare isActive: boolean
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'SalaryComponent',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      structureId: { type: 'string', indexed: true },
      code: { type: 'string', indexed: true },
      name: 'string',
      nameAr: { type: 'string', optional: true },
      type: { type: 'string', default: SalaryComponentType.Earning },
      calculationType: { type: 'string', default: SalaryComponentCalculation.Fixed },
      defaultValue: { type: 'double', default: 0 },
      percentageOf: { type: 'string', default: SalaryComponentPercentageBase.BasicOnly },
      sortOrder: { type: 'int', default: 0 },
      isStatutory: { type: 'bool', default: false },
      isActive: { type: 'bool', default: true },
    },
  }
}

export type SalaryComponentEntity = SalaryComponent & SoftDeletableEntityFields
