export const OrganizationStatus = {
  Active: 'active',
  Inactive: 'inactive',
} as const

export type OrganizationStatusValue = (typeof OrganizationStatus)[keyof typeof OrganizationStatus]

export interface OrganizationInput {
  code: string
  name: string
  nameAr?: string
  legalName?: string
  taxNumber?: string
  registrationNumber?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  currency?: string
  timezone?: string
  language?: 'ar' | 'en'
  status?: OrganizationStatusValue
  notes?: string
}

export interface Organization {
  _id: string
  code: string
  name: string
  nameAr: string | null
  legalName: string | null
  taxNumber: string | null
  registrationNumber: string | null
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
  currency: string
  timezone: string
  language: 'ar' | 'en'
  status: OrganizationStatusValue
  notes: string | null
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
  deletedAt: Date | null
}
