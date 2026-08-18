import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'
import { MilestoneStatus, type MilestoneStatusValue } from './MilestoneStatus'

export { MilestoneStatus, type MilestoneStatusValue } from './MilestoneStatus'

export interface MilestoneInput {
  projectId: string
  name: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  dueDate: Date
  status?: MilestoneStatusValue
  completedAt?: Date
  notes?: string
}

export class Milestone extends Realm.Object<Milestone> {
  declare _id: string
  declare projectId: string
  declare name: string
  declare nameAr: string | null
  declare description: string | null
  declare descriptionAr: string | null
  declare dueDate: Date
  declare status: MilestoneStatusValue
  declare completedAt: Date | null
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  get displayName(): string {
    return this.nameAr && this.nameAr.trim() ? this.nameAr : this.name
  }

  get isOverdue(): boolean {
    return this.status !== MilestoneStatus.Achieved && new Date() > this.dueDate
  }

  static schema: Realm.ObjectSchema = {
    name: 'Milestone',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      projectId: { type: 'string', indexed: true },
      name: 'string',
      nameAr: { type: 'string', optional: true },
      description: { type: 'string', optional: true },
      descriptionAr: { type: 'string', optional: true },
      dueDate: { type: 'date' },
      status: { type: 'string', default: MilestoneStatus.Pending },
      completedAt: { type: 'date', optional: true },
      notes: { type: 'string', optional: true },
    },
  }
}

export type MilestoneEntity = Milestone & SoftDeletableEntityFields
