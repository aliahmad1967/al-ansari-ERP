import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const TaskStatus = {
  Todo: 'todo',
  InProgress: 'in_progress',
  InReview: 'in_review',
  Done: 'done',
  Cancelled: 'cancelled',
} as const

export type TaskStatusValue = (typeof TaskStatus)[keyof typeof TaskStatus]

export const TaskPriority = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
  Critical: 'critical',
} as const

export type TaskPriorityValue = (typeof TaskPriority)[keyof typeof TaskPriority]

export interface TaskInput {
  projectId: string
  milestoneId?: string
  taskCode: string
  title: string
  titleAr?: string
  description?: string
  descriptionAr?: string
  status?: TaskStatusValue
  priority?: TaskPriorityValue
  assignedToId?: string
  parentTaskId?: string
  estimatedHours?: number
  loggedHours?: number
  startDate?: Date
  dueDate?: Date
  completedAt?: Date
  tags?: string
  notes?: string
}

export class Task extends Realm.Object<Task> {
  declare _id: string
  declare projectId: string
  declare milestoneId: string | null
  declare taskCode: string
  declare title: string
  declare titleAr: string | null
  declare description: string | null
  declare descriptionAr: string | null
  declare status: TaskStatusValue
  declare priority: TaskPriorityValue
  declare assignedToId: string | null
  declare parentTaskId: string | null
  declare estimatedHours: number
  declare loggedHours: number
  declare startDate: Date | null
  declare dueDate: Date | null
  declare completedAt: Date | null
  declare tags: string | null
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  get displayTitle(): string {
    return this.titleAr && this.titleAr.trim() ? this.titleAr : this.title
  }

  get isOverdue(): boolean {
    if (!this.dueDate) return false
    return this.status !== TaskStatus.Done && this.status !== TaskStatus.Cancelled && new Date() > this.dueDate
  }

  get completionPercentage(): number {
    if (this.estimatedHours <= 0) return 0
    return Math.min(100, Math.round((this.loggedHours / this.estimatedHours) * 100))
  }

  static schema: Realm.ObjectSchema = {
    name: 'Task',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      projectId: { type: 'string', indexed: true },
      milestoneId: { type: 'string', optional: true, indexed: true },
      taskCode: { type: 'string', indexed: true },
      title: 'string',
      titleAr: { type: 'string', optional: true },
      description: { type: 'string', optional: true },
      descriptionAr: { type: 'string', optional: true },
      status: { type: 'string', default: TaskStatus.Todo },
      priority: { type: 'string', default: TaskPriority.Medium },
      assignedToId: { type: 'string', optional: true, indexed: true },
      parentTaskId: { type: 'string', optional: true, indexed: true },
      estimatedHours: { type: 'double', default: 0 },
      loggedHours: { type: 'double', default: 0 },
      startDate: { type: 'date', optional: true },
      dueDate: { type: 'date', optional: true },
      completedAt: { type: 'date', optional: true },
      tags: { type: 'string', optional: true },
      notes: { type: 'string', optional: true },
    },
  }
}

export type TaskEntity = Task & SoftDeletableEntityFields
