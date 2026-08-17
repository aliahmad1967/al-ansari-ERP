export const BranchStatus = {
  Active: 'active',
  Inactive: 'inactive',
} as const

export type BranchStatusValue = (typeof BranchStatus)[keyof typeof BranchStatus]

export interface BranchInput {
  code: string
  name: string
  nameAr?: string
  organizationId: string
  city?: string
  address?: string
  phone?: string
  email?: string
  status?: BranchStatusValue
  notes?: string
}

export interface Branch {
  _id: string
  code: string
  name: string
  nameAr: string | null
  organizationId: string
  city: string | null
  address: string | null
  phone: string | null
  email: string | null
  status: BranchStatusValue
  notes: string | null
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
  deletedAt: Date | null
}
