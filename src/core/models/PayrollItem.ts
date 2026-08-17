import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const PayrollItemStatus = {
  Calculated: 'calculated',
  Reviewed: 'reviewed',
  Approved: 'approved',
  Paid: 'paid',
} as const

export type PayrollItemStatusValue = (typeof PayrollItemStatus)[keyof typeof PayrollItemStatus]

export interface PayrollItemInput {
  payrollRunId: string
  employeeId: string
  periodId: string
  basicSalary: number
  totalEarnings: number
  totalDeductions: number
  totalBenefits: number
  netPay: number
  currency: string
  status?: PayrollItemStatusValue
}

export class PayrollItem extends Realm.Object<PayrollItem> {
  declare _id: string
  declare payrollRunId: string
  declare employeeId: string
  declare periodId: string
  declare basicSalary: number
  declare totalEarnings: number
  declare totalDeductions: number
  declare totalBenefits: number
  declare netPay: number
  declare currency: string
  declare status: PayrollItemStatusValue
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'PayrollItem',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      payrollRunId: { type: 'string', indexed: true },
      employeeId: { type: 'string', indexed: true },
      periodId: { type: 'string', indexed: true },
      basicSalary: { type: 'double', default: 0 },
      totalEarnings: { type: 'double', default: 0 },
      totalDeductions: { type: 'double', default: 0 },
      totalBenefits: { type: 'double', default: 0 },
      netPay: { type: 'double', default: 0 },
      currency: { type: 'string', default: 'SAR' },
      status: { type: 'string', default: PayrollItemStatus.Calculated },
    },
  }
}

export type PayrollItemEntity = PayrollItem & SoftDeletableEntityFields
