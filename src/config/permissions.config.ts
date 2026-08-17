/**
 * Permission configuration — the single source of truth for all valid
 * module/resource/action triples and the system role definitions.
 *
 * This config is used by:
 *  - the seed process to create permission records,
 *  - PermissionService for runtime validation,
 *  - the UI to render permission management interfaces.
 */

export const PERMISSION_MODULES = [
  'hr',
  'finance',
  'inventory',
  'procurement',
  'sales',
  'assets',
  'projects',
  'organization',
  'settings',
  'reports',
  'notifications',
] as const

export type PermissionModule = (typeof PERMISSION_MODULES)[number]

export const MODULE_RESOURCES: Record<PermissionModule, readonly string[]> = {
  hr: ['employee', 'attendance', 'leave', 'payroll', 'recruitment'],
  finance: ['invoice', 'payment', 'voucher', 'account', 'budget'],
  inventory: ['product', 'category', 'warehouse', 'stock', 'adjustment'],
  procurement: ['purchase-order', 'supplier', 'goods-receipt', 'request'],
  sales: ['customer', 'sales-order', 'delivery', 'quotation', 'invoice'],
  assets: ['asset', 'asset-category', 'maintenance'],
  projects: ['project', 'task', 'milestone', 'timesheet'],
  organization: ['organization', 'branch', 'department', 'user', 'role', 'permission'],
  settings: ['system', 'security', 'backup'],
  reports: ['report'],
  notifications: ['notification'],
}

export const BASE_ACTIONS = ['view', 'create', 'update', 'delete'] as const

export const APPROVAL_MODULES = new Set<PermissionModule>([
  'hr',
  'finance',
  'procurement',
  'sales',
])

export const ALL_PERMISSION_ACTIONS = [...BASE_ACTIONS, 'approve'] as const

export interface SystemRoleConfig {
  code: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  /** Function that decides which permissions this role receives. */
  permissionFilter: (module: string, resource: string, action: string) => boolean
}

export const SYSTEM_ROLES: SystemRoleConfig[] = [
  {
    code: 'SUPER_ADMINISTRATOR',
    name: 'Super Administrator',
    nameAr: 'مدير النظام الأعلى',
    description: 'Full unrestricted access to all system resources.',
    descriptionAr: 'وصول كامل غير محدود لجميع موارد النظام.',
    permissionFilter: () => true,
  },
  {
    code: 'ADMINISTRATOR',
    name: 'Administrator',
    nameAr: 'مدير النظام',
    description: 'Full access to all modules except system security settings.',
    descriptionAr: 'وصول كامل لجميع الوحدات باستثناء إعدادات الأمان.',
    permissionFilter: (module, _resource, action) => {
      if (module === 'settings' && action !== 'view') return false
      return true
    },
  },
  {
    code: 'HR_MANAGER',
    name: 'HR Manager',
    nameAr: 'مدير الموارد البشرية',
    description: 'Full HR module access plus read access to related modules.',
    descriptionAr: 'وصول كامل لوحدة الموارد البشرية مع وصول للقراءة للوحدات ذات الصلة.',
    permissionFilter: (module, _resource, action) => {
      if (module === 'hr') return true
      if (action === 'view' && ['organization', 'reports', 'notifications'].includes(module))
        return true
      return false
    },
  },
  {
    code: 'FINANCE_MANAGER',
    name: 'Finance Manager',
    nameAr: 'مدير المالية',
    description: 'Full finance module access plus read access to related modules.',
    descriptionAr: 'وصول كامل لوحدة المالية مع وصول للقراءة للوحدات ذات الصلة.',
    permissionFilter: (module, _resource, action) => {
      if (module === 'finance') return true
      if (action === 'view' && ['reports', 'notifications'].includes(module)) return true
      return false
    },
  },
  {
    code: 'INVENTORY_MANAGER',
    name: 'Inventory Manager',
    nameAr: 'مدير المخزون',
    description: 'Full inventory module access plus read access to related modules.',
    descriptionAr: 'وصول كامل لوحدة المخزون مع وصول للقراءة للوحدات ذات الصلة.',
    permissionFilter: (module, _resource, action) => {
      if (module === 'inventory') return true
      if (action === 'view' && ['reports', 'notifications', 'procurement'].includes(module))
        return true
      return false
    },
  },
  {
    code: 'PROCUREMENT_MANAGER',
    name: 'Procurement Manager',
    nameAr: 'مدير المشتريات',
    description: 'Full procurement module access plus read access to related modules.',
    descriptionAr: 'وصول كامل لوحدة المشتريات مع وصول للقراءة للوحدات ذات الصلة.',
    permissionFilter: (module, _resource, action) => {
      if (module === 'procurement') return true
      if (action === 'view' && ['inventory', 'reports', 'notifications'].includes(module))
        return true
      return false
    },
  },
  {
    code: 'SALES_MANAGER',
    name: 'Sales Manager',
    nameAr: 'مدير المبيعات',
    description: 'Full sales module access plus read access to related modules.',
    descriptionAr: 'وصول كامل لوحدة المبيعات مع وصول للقراءة للوحدات ذات الصلة.',
    permissionFilter: (module, _resource, action) => {
      if (module === 'sales') return true
      if (action === 'view' && ['inventory', 'reports', 'notifications'].includes(module))
        return true
      return false
    },
  },
  {
    code: 'EMPLOYEE',
    name: 'Employee',
    nameAr: 'موظف',
    description: 'Basic read access to relevant modules.',
    descriptionAr: 'وصول قراءة أساسي للوحدات ذات الصلة.',
    permissionFilter: (module, _resource, action) => {
      if (action !== 'view') return false
      return ['hr', 'inventory', 'sales', 'notifications'].includes(module)
    },
  },
  {
    code: 'VIEWER',
    name: 'Viewer',
    nameAr: 'مشاهد',
    description: 'Read-only access across all modules.',
    descriptionAr: 'وصول للقراءة فقط عبر جميع الوحدات.',
    permissionFilter: (_module, _resource, action) => action === 'view',
  },
]
