import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'
import { ProjectExpenseStatus, type ProjectExpenseStatusValue, type ProjectExpenseCategoryValue } from './ProjectExpenseStatus'

export { ProjectExpenseStatus, type ProjectExpenseStatusValue, ProjectExpenseCategory, type ProjectExpenseCategoryValue } from './ProjectExpenseStatus'

export interface ProjectExpenseInput {
  projectId: string
  taskId?: string
  employeeId?: string
  category: ProjectExpenseCategoryValue
  description: string
  descriptionAr?: string
  amount: number
  currency?: string
  expenseDate: Date
  receiptUrl?: string
  status?: ProjectExpenseStatusValue
  notes?: string
}

export class ProjectExpense extends Realm.Object<ProjectExpense> {
  declare _id: string
  declare projectId: string
  declare taskId: string | null
  declare employeeId: string | null
  declare category: ProjectExpenseCategoryValue
  declare description: string
  declare descriptionAr: string | null
  declare amount: number
  declare currency: string
  declare expenseDate: Date
  declare receiptUrl: string | null
  declare status: ProjectExpenseStatusValue
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'ProjectExpense',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      projectId: { type: 'string', indexed: true },
      taskId: { type: 'string', optional: true, indexed: true },
      employeeId: { type: 'string', optional: true, indexed: true },
      category: 'string',
      description: 'string',
      descriptionAr: { type: 'string', optional: true },
      amount: 'double',
      currency: { type: 'string', default: 'SAR' },
      expenseDate: { type: 'date' },
      receiptUrl: { type: 'string', optional: true },
      status: { type: 'string', default: ProjectExpenseStatus.Pending },
      notes: { type: 'string', optional: true },
    },
  }
}

export type ProjectExpenseEntity = ProjectExpense & SoftDeletableEntityFields
