import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const PayslipStatus = {
  Generated: 'generated',
  Sent: 'sent',
  Viewed: 'viewed',
} as const

export type PayslipStatusValue = (typeof PayslipStatus)[keyof typeof PayslipStatus]

export interface PayslipInput {
  payrollItemId: string
  employeeId: string
  periodId: string
  payslipNumber: string
  basicSalary: number
  totalEarnings: number
  totalDeductions: number
  totalBenefits: number
  netPay: number
  currency: string
  status?: PayslipStatusValue
}

export class Payslip extends Realm.Object<Payslip> {
  declare _id: string
  declare payrollItemId: string
  declare employeeId: string
  declare periodId: string
  declare payslipNumber: string
  declare basicSalary: number
  declare totalEarnings: number
  declare totalDeductions: number
  declare totalBenefits: number
  declare netPay: number
  declare currency: string
  declare generatedAt: Date
  declare status: PayslipStatusValue
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'Payslip',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      payrollItemId: { type: 'string', indexed: true },
      employeeId: { type: 'string', indexed: true },
      periodId: { type: 'string', indexed: true },
      payslipNumber: { type: 'string', indexed: true },
      basicSalary: { type: 'double', default: 0 },
      totalEarnings: { type: 'double', default: 0 },
      totalDeductions: { type: 'double', default: 0 },
      totalBenefits: { type: 'double', default: 0 },
      netPay: { type: 'double', default: 0 },
      currency: { type: 'string', default: 'SAR' },
      generatedAt: { type: 'date' },
      status: { type: 'string', default: PayslipStatus.Generated },
    },
  }
}

export type PayslipEntity = Payslip & SoftDeletableEntityFields
