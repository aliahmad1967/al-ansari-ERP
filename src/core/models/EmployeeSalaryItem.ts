import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export interface EmployeeSalaryItemInput {
  employeeSalaryId: string
  componentId: string
  amount: number
}

export class EmployeeSalaryItem extends Realm.Object<EmployeeSalaryItem> {
  declare _id: string
  declare employeeSalaryId: string
  declare componentId: string
  declare amount: number
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'EmployeeSalaryItem',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      employeeSalaryId: { type: 'string', indexed: true },
      componentId: { type: 'string', indexed: true },
      amount: { type: 'double', default: 0 },
    },
  }
}

export type EmployeeSalaryItemEntity = EmployeeSalaryItem & SoftDeletableEntityFields
