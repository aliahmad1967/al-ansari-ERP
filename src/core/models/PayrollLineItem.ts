import Realm from 'realm'

import { BASE_PROPERTIES } from './base'
import { SalaryComponentType, type SalaryComponentTypeValue } from './SalaryComponent'

export interface PayrollLineItemInput {
  payrollItemId: string
  componentId: string
  componentCode: string
  componentName: string
  componentNameAr: string
  componentType: SalaryComponentTypeValue
  baseAmount: number
  amount: number
}

export class PayrollLineItem extends Realm.Object<PayrollLineItem> {
  declare _id: string
  declare payrollItemId: string
  declare componentId: string
  declare componentCode: string
  declare componentName: string
  declare componentNameAr: string
  declare componentType: SalaryComponentTypeValue
  declare baseAmount: number
  declare amount: number
  declare createdAt: Date
  declare updatedAt: Date

  static schema: Realm.ObjectSchema = {
    name: 'PayrollLineItem',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      payrollItemId: { type: 'string', indexed: true },
      componentId: { type: 'string', indexed: true },
      componentCode: 'string',
      componentName: 'string',
      componentNameAr: { type: 'string', default: '' },
      componentType: { type: 'string', default: SalaryComponentType.Earning },
      baseAmount: { type: 'double', default: 0 },
      amount: { type: 'double', default: 0 },
    },
  }
}

export type PayrollLineItemEntity = PayrollLineItem
