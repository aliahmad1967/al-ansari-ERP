export const EmployeeStatus = {
  Active: 'active',
  Inactive: 'inactive',
  Suspended: 'suspended',
  Terminated: 'terminated',
} as const

export type EmployeeStatusValue = (typeof EmployeeStatus)[keyof typeof EmployeeStatus]

export interface Employee {
  _id: string
  employeeNumber: string
  firstName: string
  lastName: string
  firstNameAr: string
  lastNameAr: string
  email: string
  phone: string | null
  dateOfBirth: Date | null
  gender: string | null
  nationality: string | null
  nationalId: string | null
  maritalStatus: string | null
  address: string | null
  city: string | null
  country: string | null
  photoUrl: string | null
  organizationId: string | null
  branchId: string | null
  departmentId: string | null
  positionId: string | null
  managerId: string | null
  employmentDate: Date
  terminationDate: Date | null
  status: EmployeeStatusValue
  notes: string | null
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
  deletedAt: Date | null
}

export interface EmployeeInput {
  employeeNumber: string
  firstName: string
  lastName: string
  firstNameAr?: string
  lastNameAr?: string
  email: string
  phone?: string
  dateOfBirth?: Date
  gender?: string
  nationality?: string
  nationalId?: string
  maritalStatus?: string
  address?: string
  city?: string
  country?: string
  photoUrl?: string
  organizationId?: string
  branchId?: string
  departmentId?: string
  positionId?: string
  managerId?: string
  employmentDate: Date
  terminationDate?: Date
  status?: EmployeeStatusValue
  notes?: string
}
