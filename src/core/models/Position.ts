/**
 * Position — a job title within a {@link Department}, carrying a grade level
 * and an active/inactive status.
 */

import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'
import type { Department } from './Department'

export const PositionStatus = {
  Active: 'active',
  Inactive: 'inactive',
} as const

export type PositionStatusValue = (typeof PositionStatus)[keyof typeof PositionStatus]

export interface PositionInput {
  code: string
  title: string
  titleAr?: string
  department: Department
  grade?: string
  status?: PositionStatusValue
  notes?: string
}

export class Position extends Realm.Object<Position> {
  declare _id: string
  declare code: string
  declare title: string
  declare titleAr: string | null
  declare department: Department
  declare grade: string | null
  declare status: PositionStatusValue
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  /** Convenience accessor: the parent department's primary key. */
  get departmentId(): string | null {
    return this.department?._id ?? null
  }

  static schema: Realm.ObjectSchema = {
    name: 'Position',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      code: { type: 'string', indexed: true },
      title: 'string',
      titleAr: { type: 'string', optional: true },
      department: { type: 'object', objectType: 'Department', optional: true },
      grade: { type: 'string', optional: true },
      status: { type: 'string', default: PositionStatus.Active },
      notes: { type: 'string', optional: true },
    },
  }
}

/** Entity shape used by repositories (persisted + soft-delete fields). */
export type PositionEntity = Position & SoftDeletableEntityFields
