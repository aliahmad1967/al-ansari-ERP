import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export interface EducationInput {
  employeeId: string
  institution: string
  degree: string
  fieldOfStudy: string
  startDate?: Date
  endDate?: Date
  notes?: string
}

export class Education extends Realm.Object<Education> {
  declare _id: string
  declare employeeId: string
  declare institution: string
  declare degree: string
  declare fieldOfStudy: string
  declare startDate: Date | null
  declare endDate: Date | null
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'Education',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      employeeId: { type: 'string', indexed: true },
      institution: 'string',
      degree: 'string',
      fieldOfStudy: 'string',
      startDate: { type: 'date', optional: true },
      endDate: { type: 'date', optional: true },
      notes: { type: 'string', optional: true },
    },
  }
}

export type EducationEntity = Education & SoftDeletableEntityFields
