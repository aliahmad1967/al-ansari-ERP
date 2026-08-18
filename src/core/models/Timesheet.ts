import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export const TimesheetStatus = {
  Draft: 'draft',
  Submitted: 'submitted',
  Approved: 'approved',
  Rejected: 'rejected',
} as const

export type TimesheetStatusValue = (typeof TimesheetStatus)[keyof typeof TimesheetStatus]

export interface TimesheetInput {
  projectId: string
  taskId?: string
  employeeId: string
  date: Date
  hours: number
  description?: string
  descriptionAr?: string
  status?: TimesheetStatusValue
  billable?: boolean
}

export class Timesheet extends Realm.Object<Timesheet> {
  declare _id: string
  declare projectId: string
  declare taskId: string | null
  declare employeeId: string
  declare date: Date
  declare hours: number
  declare description: string | null
  declare descriptionAr: string | null
  declare status: TimesheetStatusValue
  declare billable: boolean
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'Timesheet',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      projectId: { type: 'string', indexed: true },
      taskId: { type: 'string', optional: true, indexed: true },
      employeeId: { type: 'string', indexed: true },
      date: { type: 'date' },
      hours: 'double',
      description: { type: 'string', optional: true },
      descriptionAr: { type: 'string', optional: true },
      status: { type: 'string', default: TimesheetStatus.Draft },
      billable: { type: 'bool', default: true },
    },
  }
}

export type TimesheetEntity = Timesheet & SoftDeletableEntityFields
