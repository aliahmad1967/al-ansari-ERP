import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const EmployeeSalaryStatus = {
  Active: 'active',
  Inactive: 'inactive',
} as const

export type EmployeeSalaryStatusValue = (typeof EmployeeSalaryStatus)[keyof typeof EmployeeSalaryStatus]

export interface EmployeeSalaryInput {
  employeeId: string
  structureId: string
  basicSalary: number
  currency: string
  effectiveFrom: Date
  effectiveTo?: Date
  status?: EmployeeSalaryStatusValue
}

export class EmployeeSalary extends Realm.Object<EmployeeSalary> {
  declare _id: string
  declare employeeId: string
  declare structureId: string
  declare basicSalary: number
  declare currency: string
  declare effectiveFrom: Date
  declare effectiveTo: Date | null
  declare status: EmployeeSalaryStatusValue
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'EmployeeSalary',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      employeeId: { type: 'string', indexed: true },
      structureId: { type: 'string', indexed: true },
      basicSalary: { type: 'double', default: 0 },
      currency: { type: 'string', default: 'SAR' },
      effectiveFrom: { type: 'date' },
      effectiveTo: { type: 'date', optional: true },
      status: { type: 'string', default: EmployeeSalaryStatus.Active },
    },
  }
}

export type EmployeeSalaryEntity = EmployeeSalary & SoftDeletableEntityFields
