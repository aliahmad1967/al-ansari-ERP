import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'
import { ProjectStatus, type ProjectStatusValue, ProjectPriority, type ProjectPriorityValue } from './ProjectStatus'

export { ProjectStatus, type ProjectStatusValue, ProjectPriority, type ProjectPriorityValue } from './ProjectStatus'

export interface ProjectInput {
  projectCode: string
  name: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  status?: ProjectStatusValue
  priority?: ProjectPriorityValue
  startDate?: Date
  endDate?: Date
  actualEndDate?: Date
  managerId?: string
  customerId?: string
  organizationId?: string
  branchId?: string
  departmentId?: string
  budget?: number
  spentBudget?: number
  progress?: number
  notes?: string
}

export class Project extends Realm.Object<Project> {
  declare _id: string
  declare projectCode: string
  declare name: string
  declare nameAr: string | null
  declare description: string | null
  declare descriptionAr: string | null
  declare status: ProjectStatusValue
  declare priority: ProjectPriorityValue
  declare startDate: Date | null
  declare endDate: Date | null
  declare actualEndDate: Date | null
  declare managerId: string | null
  declare customerId: string | null
  declare organizationId: string | null
  declare branchId: string | null
  declare departmentId: string | null
  declare budget: number
  declare spentBudget: number
  declare progress: number
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  get displayName(): string {
    return this.nameAr && this.nameAr.trim() ? this.nameAr : this.name
  }

  get budgetRemaining(): number {
    return this.budget - this.spentBudget
  }

  get isOverBudget(): boolean {
    return this.spentBudget > this.budget
  }

  static schema: Realm.ObjectSchema = {
    name: 'Project',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      projectCode: { type: 'string', indexed: true },
      name: 'string',
      nameAr: { type: 'string', optional: true },
      description: { type: 'string', optional: true },
      descriptionAr: { type: 'string', optional: true },
      status: { type: 'string', default: ProjectStatus.Planning },
      priority: { type: 'string', default: ProjectPriority.Medium },
      startDate: { type: 'date', optional: true },
      endDate: { type: 'date', optional: true },
      actualEndDate: { type: 'date', optional: true },
      managerId: { type: 'string', optional: true, indexed: true },
      customerId: { type: 'string', optional: true, indexed: true },
      organizationId: { type: 'string', optional: true, indexed: true },
      branchId: { type: 'string', optional: true, indexed: true },
      departmentId: { type: 'string', optional: true, indexed: true },
      budget: { type: 'double', default: 0 },
      spentBudget: { type: 'double', default: 0 },
      progress: { type: 'double', default: 0 },
      notes: { type: 'string', optional: true },
    },
  }
}

export type ProjectEntity = Project & SoftDeletableEntityFields
