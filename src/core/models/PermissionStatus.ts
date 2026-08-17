export interface PermissionInput {
  code: string
  name: string
  nameAr?: string
  module: string
  resource: string
  action: string
  description?: string
}

export function buildPermissionCode(module: string, resource: string, action: string): string {
  return `${module}.${resource}.${action}`
}

export interface Permission {
  _id: string
  code: string
  name: string
  nameAr: string | null
  module: string
  resource: string
  action: string
  description: string | null
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
  deletedAt: Date | null
}
