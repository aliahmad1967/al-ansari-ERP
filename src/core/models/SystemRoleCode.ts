export const SystemRoleCode = {
  SuperAdministrator: 'SUPER_ADMINISTRATOR',
  Administrator: 'ADMINISTRATOR',
  HRManager: 'HR_MANAGER',
  FinanceManager: 'FINANCE_MANAGER',
  InventoryManager: 'INVENTORY_MANAGER',
  ProcurementManager: 'PROCUREMENT_MANAGER',
  SalesManager: 'SALES_MANAGER',
  Employee: 'EMPLOYEE',
  Viewer: 'VIEWER',
} as const

export interface RoleInput {
  code: string
  name: string
  nameAr?: string
  description?: string
  isSystem?: boolean
  permissionIds: string[]
}

export interface Role {
  _id: string
  code: string
  name: string
  nameAr: string | null
  description: string | null
  isSystem: boolean
  permissionIds: string[]
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
  deletedAt: Date | null
}
