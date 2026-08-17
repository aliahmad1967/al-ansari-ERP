import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export interface EmployeeDocumentInput {
  employeeId: string
  name: string
  type: string
  fileUrl?: string
  expiryDate?: Date
  notes?: string
}

export class EmployeeDocument extends Realm.Object<EmployeeDocument> {
  declare _id: string
  declare employeeId: string
  declare name: string
  declare type: string
  declare fileUrl: string | null
  declare expiryDate: Date | null
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'EmployeeDocument',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      employeeId: { type: 'string', indexed: true },
      name: 'string',
      type: 'string',
      fileUrl: { type: 'string', optional: true },
      expiryDate: { type: 'date', optional: true },
      notes: { type: 'string', optional: true },
    },
  }
}

export type EmployeeDocumentEntity = EmployeeDocument & SoftDeletableEntityFields
