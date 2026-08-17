import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const PayrollRunStatus = {
  Draft: 'draft',
  Calculating: 'calculating',
  Calculated: 'calculated',
  Reviewing: 'reviewing',
  Approved: 'approved',
  Finalized: 'finalized',
  Reversed: 'reversed',
} as const

export type PayrollRunStatusValue = (typeof PayrollRunStatus)[keyof typeof PayrollRunStatus]

export interface PayrollRunInput {
  periodId: string
  notes?: string
  reversalOfId?: string
}

export interface PayrollRunUpdate {
  periodId?: string
  runNumber?: number
  status?: PayrollRunStatusValue
  totalGross?: number
  totalDeductions?: number
  totalNet?: number
  employeeCount?: number
  approvedBy?: string
  approvedAt?: Date
  finalizedBy?: string
  finalizedAt?: Date
  reversedBy?: string
  reversedAt?: Date
  reversalOfId?: string
  notes?: string
}

export class PayrollRun extends Realm.Object<PayrollRun> {
  declare _id: string
  declare periodId: string
  declare runNumber: number
  declare status: PayrollRunStatusValue
  declare totalGross: number
  declare totalDeductions: number
  declare totalNet: number
  declare employeeCount: number
  declare approvedBy: string | null
  declare approvedAt: Date | null
  declare finalizedBy: string | null
  declare finalizedAt: Date | null
  declare reversedBy: string | null
  declare reversedAt: Date | null
  declare reversalOfId: string | null
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'PayrollRun',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      periodId: { type: 'string', indexed: true },
      runNumber: { type: 'int', default: 0 },
      status: { type: 'string', default: PayrollRunStatus.Draft },
      totalGross: { type: 'double', default: 0 },
      totalDeductions: { type: 'double', default: 0 },
      totalNet: { type: 'double', default: 0 },
      employeeCount: { type: 'int', default: 0 },
      approvedBy: { type: 'string', optional: true },
      approvedAt: { type: 'date', optional: true },
      finalizedBy: { type: 'string', optional: true },
      finalizedAt: { type: 'date', optional: true },
      reversedBy: { type: 'string', optional: true },
      reversedAt: { type: 'date', optional: true },
      reversalOfId: { type: 'string', optional: true, indexed: true },
      notes: { type: 'string', optional: true },
    },
  }
}

export type PayrollRunEntity = PayrollRun & SoftDeletableEntityFields
