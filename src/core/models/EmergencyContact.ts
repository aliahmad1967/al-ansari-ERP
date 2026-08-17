import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export interface EmergencyContactInput {
  employeeId: string
  name: string
  phone: string
  relationship: string
}

export class EmergencyContact extends Realm.Object<EmergencyContact> {
  declare _id: string
  declare employeeId: string
  declare name: string
  declare phone: string
  declare relationship: string
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'EmergencyContact',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      employeeId: { type: 'string', indexed: true },
      name: 'string',
      phone: 'string',
      relationship: 'string',
    },
  }
}

export type EmergencyContactEntity = EmergencyContact & SoftDeletableEntityFields
