import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'
import { ContractStatus, type ContractStatusValue } from './ContractStatus'
import { ContractType, type ContractTypeValue } from './ContractType'

export { ContractStatus, type ContractStatusValue } from './ContractStatus'
export { ContractType, type ContractTypeValue } from './ContractType'

export interface EmploymentContractInput {
  employeeId: string
  contractNumber: string
  type: ContractTypeValue
  startDate: Date
  endDate?: Date
  salary?: number
  status?: ContractStatusValue
  notes?: string
}

export class EmploymentContract extends Realm.Object<EmploymentContract> {
  declare _id: string
  declare employeeId: string
  declare contractNumber: string
  declare type: ContractTypeValue
  declare startDate: Date
  declare endDate: Date | null
  declare salary: number | null
  declare status: ContractStatusValue
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'EmploymentContract',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      employeeId: { type: 'string', indexed: true },
      contractNumber: { type: 'string', indexed: true },
      type: { type: 'string', default: ContractType.FullTime },
      startDate: { type: 'date' },
      endDate: { type: 'date', optional: true },
      salary: { type: 'double', optional: true },
      status: { type: 'string', default: ContractStatus.Active },
      notes: { type: 'string', optional: true },
    },
  }
}

export type EmploymentContractEntity = EmploymentContract & SoftDeletableEntityFields
