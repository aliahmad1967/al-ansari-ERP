import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export interface ExperienceInput {
  employeeId: string
  company: string
  title: string
  startDate?: Date
  endDate?: Date
  description?: string
}

export class Experience extends Realm.Object<Experience> {
  declare _id: string
  declare employeeId: string
  declare company: string
  declare title: string
  declare startDate: Date | null
  declare endDate: Date | null
  declare description: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'Experience',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      employeeId: { type: 'string', indexed: true },
      company: 'string',
      title: 'string',
      startDate: { type: 'date', optional: true },
      endDate: { type: 'date', optional: true },
      description: { type: 'string', optional: true },
    },
  }
}

export type ExperienceEntity = Experience & SoftDeletableEntityFields
