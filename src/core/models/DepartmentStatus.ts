export const DepartmentStatus = {
  Active: 'active',
  Inactive: 'inactive',
} as const

export type DepartmentStatusValue = (typeof DepartmentStatus)[keyof typeof DepartmentStatus]

export interface DepartmentInput {
  code: string
  name: string
  nameAr?: string
  branchId: string
  managerId?: string
  status?: DepartmentStatusValue
  notes?: string
}

export interface Department {
  _id: string
  code: string
  name: string
  nameAr: string | null
  branchId: string
  managerId: string | null
  status: DepartmentStatusValue
  notes: string | null
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
  deletedAt: Date | null
}
