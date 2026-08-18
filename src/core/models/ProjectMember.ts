import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'
import { ProjectMemberRole, type ProjectMemberRoleValue } from './ProjectMemberRole'

export { ProjectMemberRole, type ProjectMemberRoleValue } from './ProjectMemberRole'

export interface ProjectMemberInput {
  projectId: string
  employeeId: string
  role?: ProjectMemberRoleValue
  hourlyRate?: number
  joinedAt?: Date
  leftAt?: Date
  notes?: string
}

export class ProjectMember extends Realm.Object<ProjectMember> {
  declare _id: string
  declare projectId: string
  declare employeeId: string
  declare role: ProjectMemberRoleValue
  declare hourlyRate: number
  declare joinedAt: Date
  declare leftAt: Date | null
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'ProjectMember',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      projectId: { type: 'string', indexed: true },
      employeeId: { type: 'string', indexed: true },
      role: { type: 'string', default: ProjectMemberRole.Member },
      hourlyRate: { type: 'double', default: 0 },
      joinedAt: { type: 'date' },
      leftAt: { type: 'date', optional: true },
      notes: { type: 'string', optional: true },
    },
  }
}

export type ProjectMemberEntity = ProjectMember & SoftDeletableEntityFields
