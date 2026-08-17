import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const SkillLevel = {
  Beginner: 'beginner',
  Intermediate: 'intermediate',
  Advanced: 'advanced',
  Expert: 'expert',
} as const

export type SkillLevelValue = (typeof SkillLevel)[keyof typeof SkillLevel]

export interface SkillInput {
  employeeId: string
  name: string
  level: SkillLevelValue
  category?: string
}

export class Skill extends Realm.Object<Skill> {
  declare _id: string
  declare employeeId: string
  declare name: string
  declare level: SkillLevelValue
  declare category: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'Skill',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      employeeId: { type: 'string', indexed: true },
      name: 'string',
      level: { type: 'string', default: SkillLevel.Intermediate },
      category: { type: 'string', optional: true },
    },
  }
}

export type SkillEntity = Skill & SoftDeletableEntityFields
