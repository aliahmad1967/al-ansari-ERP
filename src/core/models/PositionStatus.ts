export const PositionStatus = {
  Active: 'active',
  Inactive: 'inactive',
} as const

export type PositionStatusValue = (typeof PositionStatus)[keyof typeof PositionStatus]

export interface PositionInput {
  code: string
  title: string
  titleAr?: string
  departmentId: string
  grade?: string
  status?: PositionStatusValue
  notes?: string
}

export interface Position {
  _id: string
  code: string
  title: string
  titleAr: string | null
  departmentId: string
  grade: string | null
  status: PositionStatusValue
  notes: string | null
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
  deletedAt: Date | null
}
