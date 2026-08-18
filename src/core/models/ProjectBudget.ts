import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'
import { ProjectBudgetStatus, type ProjectBudgetStatusValue } from './ProjectBudgetStatus'

export { ProjectBudgetStatus, type ProjectBudgetStatusValue } from './ProjectBudgetStatus'

export interface ProjectBudgetInput {
  projectId: string
  name: string
  nameAr?: string
  category: string
  allocatedAmount: number
  spentAmount?: number
  status?: ProjectBudgetStatusValue
  notes?: string
}

export class ProjectBudget extends Realm.Object<ProjectBudget> {
  declare _id: string
  declare projectId: string
  declare name: string
  declare nameAr: string | null
  declare category: string
  declare allocatedAmount: number
  declare spentAmount: number
  declare status: ProjectBudgetStatusValue
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  get remainingAmount(): number {
    return this.allocatedAmount - this.spentAmount
  }

  get utilizationPercentage(): number {
    if (this.allocatedAmount <= 0) return 0
    return Math.min(100, Math.round((this.spentAmount / this.allocatedAmount) * 100))
  }

  get isOverBudget(): boolean {
    return this.spentAmount > this.allocatedAmount
  }

  static schema: Realm.ObjectSchema = {
    name: 'ProjectBudget',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      projectId: { type: 'string', indexed: true },
      name: 'string',
      nameAr: { type: 'string', optional: true },
      category: 'string',
      allocatedAmount: 'double',
      spentAmount: { type: 'double', default: 0 },
      status: { type: 'string', default: ProjectBudgetStatus.Active },
      notes: { type: 'string', optional: true },
    },
  }
}

export type ProjectBudgetEntity = ProjectBudget & SoftDeletableEntityFields
