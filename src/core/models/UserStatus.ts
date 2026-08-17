export const UserStatus = {
  Active: 'active',
  Inactive: 'inactive',
  Suspended: 'suspended',
} as const

export type UserStatusValue = (typeof UserStatus)[keyof typeof UserStatus]

export interface UserInput {
  username: string
  email: string
  passwordHash?: string
  fullName: string
  fullNameAr?: string
  phone?: string
  status?: UserStatusValue
  roleId?: string
  organizationId?: string
  branchId?: string
  departmentId?: string
  lastLoginAt?: Date
  mustChangePassword?: boolean
  notes?: string
}

export interface User {
  _id: string
  username: string
  email: string
  fullName: string
  fullNameAr: string | null
  phone: string | null
  status: UserStatusValue
  roleId: string | null
  organizationId: string | null
  branchId: string | null
  departmentId: string | null
  lastLoginAt: Date | null
  mustChangePassword: boolean
  notes: string | null
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
  deletedAt: Date | null
}
