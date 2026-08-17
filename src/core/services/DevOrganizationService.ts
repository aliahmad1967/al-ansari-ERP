/**
 * DevOrganizationService — browser-compatible organization services using localStorage.
 *
 * Provides the same interface as the Realm-based services so the hooks can
 * fall back to it when Realm is unavailable (browser dev).
 *
 * This service is ONLY used when the Realm-native services cannot load.
 * In production (Electron/desktop), the real services with Realm are used.
 */

const DEV_STORAGE_KEY = 'erp_dev_org_data'

interface DevData {
  organizations: DevOrg[]
  branches: DevBranch[]
  departments: DevDepartment[]
  positions: DevPosition[]
  users: DevUser[]
  roles: DevRole[]
  permissions: DevPermission[]
}

interface DevOrg {
  _id: string
  code: string
  name: string
  nameAr: string | null
  email: string | null
  phone: string | null
  currency: string
  timezone: string
  language: string
  status: string
  notes: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

interface DevBranch {
  _id: string
  code: string
  name: string
  nameAr: string | null
  organizationId: string
  city: string | null
  email: string | null
  phone: string | null
  status: string
  notes: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

interface DevDepartment {
  _id: string
  code: string
  name: string
  nameAr: string | null
  branchId: string
  managerId: string | null
  status: string
  notes: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

interface DevPosition {
  _id: string
  code: string
  title: string
  titleAr: string | null
  departmentId: string
  grade: string | null
  status: string
  notes: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

interface DevUser {
  _id: string
  username: string
  email: string
  fullName: string
  fullNameAr: string | null
  phone: string | null
  status: string
  roleId: string | null
  organizationId: string | null
  branchId: string | null
  departmentId: string | null
  notes: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

interface DevRole {
  _id: string
  code: string
  name: string
  nameAr: string | null
  description: string | null
  isSystem: boolean
  permissionIds: string[]
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

interface DevPermission {
  _id: string
  code: string
  name: string
  module: string
  resource: string
  action: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

function loadData(): DevData {
  try {
    const raw = localStorage.getItem(DEV_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return {
    organizations: [],
    branches: [],
    departments: [],
    positions: [],
    users: [],
    roles: [],
    permissions: [],
  }
}

function saveData(data: DevData): void {
  localStorage.setItem(DEV_STORAGE_KEY, JSON.stringify(data))
}

function newId(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

function seedIfEmpty(data: DevData): DevData {
  if (data.organizations.length > 0) return data

  const orgId = newId()
  const branchId = newId()
  const deptAdminId = newId()
  const deptFinId = newId()
  const deptHrId = newId()
  const deptItId = newId()
  const adminUserId = newId()
  const roleId = newId()

  const ts = now()

  const permissions: DevPermission[] = [
    'organization.organization.view', 'organization.organization.create', 'organization.organization.update', 'organization.organization.delete',
    'organization.branch.view', 'organization.branch.create', 'organization.branch.update', 'organization.branch.delete',
    'organization.department.view', 'organization.department.create', 'organization.department.update', 'organization.department.delete',
    'organization.user.view', 'organization.user.create', 'organization.user.update', 'organization.user.delete',
    'organization.role.view', 'organization.role.create', 'organization.role.update', 'organization.role.delete',
    'organization.permission.view',
    'hr.employee.view', 'hr.employee.create', 'hr.employee.update', 'hr.employee.delete',
    'finance.invoice.view', 'finance.invoice.create', 'finance.invoice.update', 'finance.invoice.delete',
    'inventory.product.view', 'inventory.product.create', 'inventory.product.update', 'inventory.product.delete',
    'sales.customer.view', 'sales.customer.create', 'sales.customer.update', 'sales.customer.delete',
    'settings.system.view', 'settings.system.update',
    'reports.report.view',
    'notifications.notification.view',
  ].map((code) => {
    const parts = code.split('.')
    return {
      _id: newId(),
      code,
      name: code,
      module: parts[0] ?? '',
      resource: parts[1] ?? '',
      action: parts[2] ?? '',
      isDeleted: false,
      createdAt: ts,
      updatedAt: ts,
    }
  })

  data.organizations.push({
    _id: orgId, code: 'ORG-001', name: 'AL-ANSARI Holdings', nameAr: 'مجموعة الأنصاري',
    email: 'info@al-ansari.local', phone: null, currency: 'SAR', timezone: 'Asia/Riyadh',
    language: 'ar', status: 'active', notes: null, isDeleted: false, deletedAt: null,
    createdAt: ts, updatedAt: ts,
  })

  data.branches.push({
    _id: branchId, code: 'HQ', name: 'Head Office', nameAr: 'المكتب الرئيسي',
    organizationId: orgId, city: 'Riyadh', email: null, phone: null,
    status: 'active', notes: null, isDeleted: false, deletedAt: null,
    createdAt: ts, updatedAt: ts,
  })

  const deptNames = [
    { id: deptAdminId, code: 'ADMIN', name: 'Administration', nameAr: 'الإدارة العامة' },
    { id: deptFinId, code: 'FIN', name: 'Finance', nameAr: 'المالية' },
    { id: deptHrId, code: 'HR', name: 'Human Resources', nameAr: 'الموارد البشرية' },
    { id: deptItId, code: 'IT', name: 'Information Technology', nameAr: 'تقنية المعلومات' },
  ]
  for (const d of deptNames) {
    data.departments.push({
      _id: d.id, code: d.code, name: d.name, nameAr: d.nameAr,
      branchId, managerId: null, status: 'active', notes: null,
      isDeleted: false, deletedAt: null, createdAt: ts, updatedAt: ts,
    })
  }

  const positionNames = [
    { code: 'GM', title: 'General Manager', titleAr: 'المدير العام', deptId: deptAdminId, grade: 'G1' },
    { code: 'FIN-MGR', title: 'Finance Manager', titleAr: 'مدير المالية', deptId: deptFinId, grade: 'G2' },
    { code: 'HR-MGR', title: 'HR Manager', titleAr: 'مدير الموارد البشرية', deptId: deptHrId, grade: 'G2' },
    { code: 'IT-MGR', title: 'IT Manager', titleAr: 'مدير تقنية المعلومات', deptId: deptItId, grade: 'G2' },
  ]
  for (const p of positionNames) {
    data.positions.push({
      _id: newId(), code: p.code, title: p.title, titleAr: p.titleAr,
      departmentId: p.deptId, grade: p.grade, status: 'active', notes: null,
      isDeleted: false, deletedAt: null, createdAt: ts, updatedAt: ts,
    })
  }

  data.roles.push({
    _id: roleId, code: 'ADMINISTRATOR', name: 'Administrator', nameAr: 'مدير النظام',
    description: 'Full access', isSystem: true,
    permissionIds: permissions.map((p) => p._id),
    isDeleted: false, deletedAt: null, createdAt: ts, updatedAt: ts,
  })

  data.users.push({
    _id: adminUserId, username: 'admin', email: 'admin@al-ansari.local',
    fullName: 'System Administrator', fullNameAr: 'مدير النظام',
    phone: null, status: 'active', roleId, organizationId: orgId,
    branchId, departmentId: deptAdminId, notes: null,
    isDeleted: false, deletedAt: null, createdAt: ts, updatedAt: ts,
  })

  data.permissions = permissions
  return data
}

// ── Public API ───────────────────────────────────────────────────────────────

export interface DevOrganizationResult<T> {
  items: T[]
  loading: boolean
  error: string | null
  refresh: () => void
  create: (input: Record<string, unknown>) => T
  update: (id: string, changes: Record<string, unknown>) => T
  archive: (id: string) => boolean
  restore: (id: string) => boolean
}

function ensureSeeded(): DevData {
  let data = loadData()
  data = seedIfEmpty(data)
  saveData(data)
  return data
}

export class DevOrganizationService {
  getOrganizations(): DevOrg[] {
    const data = ensureSeeded()
    return data.organizations.filter((o) => !o.isDeleted)
  }

  getBranches(): DevBranch[] {
    const data = ensureSeeded()
    return data.branches.filter((b) => !b.isDeleted)
  }

  getDepartments(): DevDepartment[] {
    const data = ensureSeeded()
    return data.departments.filter((d) => !d.isDeleted)
  }

  getPositions(): DevPosition[] {
    const data = ensureSeeded()
    return data.positions.filter((p) => !p.isDeleted)
  }

  getUsers(): DevUser[] {
    const data = ensureSeeded()
    return data.users.filter((u) => !u.isDeleted)
  }

  getRoles(): DevRole[] {
    const data = ensureSeeded()
    return data.roles.filter((r) => !r.isDeleted)
  }

  getPermissions(): DevPermission[] {
    const data = ensureSeeded()
    return data.permissions
  }

  createOrg(input: Record<string, unknown>): DevOrg {
    const data = ensureSeeded()
    const item: DevOrg = {
      _id: newId(),
      code: String(input.code ?? ''),
      name: String(input.name ?? ''),
      nameAr: (input.nameAr as string) || null,
      email: (input.email as string) || null,
      phone: (input.phone as string) || null,
      currency: String(input.currency ?? 'SAR'),
      timezone: String(input.timezone ?? 'Asia/Riyadh'),
      language: String(input.language ?? 'ar'),
      status: String(input.status ?? 'active'),
      notes: (input.notes as string) || null,
      isDeleted: false,
      deletedAt: null,
      createdAt: now(),
      updatedAt: now(),
    }
    data.organizations.push(item)
    saveData(data)
    return item
  }

  updateOrg(id: string, changes: Record<string, unknown>): DevOrg {
    const data = ensureSeeded()
    const item = data.organizations.find((o) => o._id === id)
    if (!item) throw new Error('Not found')
    Object.assign(item, changes, { updatedAt: now() })
    saveData(data)
    return item
  }

  archiveOrg(id: string): boolean {
    const data = ensureSeeded()
    const item = data.organizations.find((o) => o._id === id)
    if (!item || item.isDeleted) return false
    item.isDeleted = true
    item.deletedAt = now()
    item.updatedAt = now()
    saveData(data)
    return true
  }

  restoreOrg(id: string): boolean {
    const data = ensureSeeded()
    const item = data.organizations.find((o) => o._id === id)
    if (!item || !item.isDeleted) return false
    item.isDeleted = false
    item.deletedAt = null
    item.updatedAt = now()
    saveData(data)
    return true
  }

  createBranch(input: Record<string, unknown>): DevBranch {
    const data = ensureSeeded()
    const item: DevBranch = {
      _id: newId(),
      code: String(input.code ?? ''),
      name: String(input.name ?? ''),
      nameAr: (input.nameAr as string) || null,
      organizationId: String((input.organization as { _id?: string })?._id ?? input.organizationId ?? ''),
      city: (input.city as string) || null,
      email: (input.email as string) || null,
      phone: (input.phone as string) || null,
      status: String(input.status ?? 'active'),
      notes: (input.notes as string) || null,
      isDeleted: false,
      deletedAt: null,
      createdAt: now(),
      updatedAt: now(),
    }
    data.branches.push(item)
    saveData(data)
    return item
  }

  updateBranch(id: string, changes: Record<string, unknown>): DevBranch {
    const data = ensureSeeded()
    const item = data.branches.find((b) => b._id === id)
    if (!item) throw new Error('Not found')
    if (changes.organization && typeof changes.organization === 'object') {
      changes.organizationId = (changes.organization as { _id: string })._id
      delete changes.organization
    }
    Object.assign(item, changes, { updatedAt: now() })
    saveData(data)
    return item
  }

  archiveBranch(id: string): boolean {
    const data = ensureSeeded()
    const item = data.branches.find((b) => b._id === id)
    if (!item || item.isDeleted) return false
    item.isDeleted = true
    item.deletedAt = now()
    saveData(data)
    return true
  }

  restoreBranch(id: string): boolean {
    const data = ensureSeeded()
    const item = data.branches.find((b) => b._id === id)
    if (!item || !item.isDeleted) return false
    item.isDeleted = false
    item.deletedAt = null
    saveData(data)
    return true
  }

  createDepartment(input: Record<string, unknown>): DevDepartment {
    const data = ensureSeeded()
    const item: DevDepartment = {
      _id: newId(),
      code: String(input.code ?? ''),
      name: String(input.name ?? ''),
      nameAr: (input.nameAr as string) || null,
      branchId: String((input.branch as { _id?: string })?._id ?? input.branchId ?? ''),
      managerId: (input.manager as { _id?: string })?._id ?? null,
      status: String(input.status ?? 'active'),
      notes: (input.notes as string) || null,
      isDeleted: false,
      deletedAt: null,
      createdAt: now(),
      updatedAt: now(),
    }
    data.departments.push(item)
    saveData(data)
    return item
  }

  updateDepartment(id: string, changes: Record<string, unknown>): DevDepartment {
    const data = ensureSeeded()
    const item = data.departments.find((d) => d._id === id)
    if (!item) throw new Error('Not found')
    if (changes.branch && typeof changes.branch === 'object') {
      changes.branchId = (changes.branch as { _id: string })._id
      delete changes.branch
    }
    if (changes.manager && typeof changes.manager === 'object') {
      changes.managerId = (changes.manager as { _id: string })._id
      delete changes.manager
    } else if (changes.manager === null || changes.manager === undefined) {
      changes.managerId = null
      delete changes.manager
    }
    Object.assign(item, changes, { updatedAt: now() })
    saveData(data)
    return item
  }

  archiveDepartment(id: string): boolean {
    const data = ensureSeeded()
    const item = data.departments.find((d) => d._id === id)
    if (!item || item.isDeleted) return false
    item.isDeleted = true
    item.deletedAt = now()
    saveData(data)
    return true
  }

  restoreDepartment(id: string): boolean {
    const data = ensureSeeded()
    const item = data.departments.find((d) => d._id === id)
    if (!item || !item.isDeleted) return false
    item.isDeleted = false
    item.deletedAt = null
    saveData(data)
    return true
  }

  createPosition(input: Record<string, unknown>): DevPosition {
    const data = ensureSeeded()
    const item: DevPosition = {
      _id: newId(),
      code: String(input.code ?? ''),
      title: String(input.title ?? ''),
      titleAr: (input.titleAr as string) || null,
      departmentId: String((input.department as { _id?: string })?._id ?? input.departmentId ?? ''),
      grade: (input.grade as string) || null,
      status: String(input.status ?? 'active'),
      notes: (input.notes as string) || null,
      isDeleted: false,
      deletedAt: null,
      createdAt: now(),
      updatedAt: now(),
    }
    data.positions.push(item)
    saveData(data)
    return item
  }

  updatePosition(id: string, changes: Record<string, unknown>): DevPosition {
    const data = ensureSeeded()
    const item = data.positions.find((p) => p._id === id)
    if (!item) throw new Error('Not found')
    if (changes.department && typeof changes.department === 'object') {
      changes.departmentId = (changes.department as { _id: string })._id
      delete changes.department
    }
    Object.assign(item, changes, { updatedAt: now() })
    saveData(data)
    return item
  }

  archivePosition(id: string): boolean {
    const data = ensureSeeded()
    const item = data.positions.find((p) => p._id === id)
    if (!item || item.isDeleted) return false
    item.isDeleted = true
    item.deletedAt = now()
    saveData(data)
    return true
  }

  restorePosition(id: string): boolean {
    const data = ensureSeeded()
    const item = data.positions.find((p) => p._id === id)
    if (!item || !item.isDeleted) return false
    item.isDeleted = false
    item.deletedAt = null
    saveData(data)
    return true
  }

  createUser(input: Record<string, unknown>): DevUser {
    const data = ensureSeeded()
    const item: DevUser = {
      _id: newId(),
      username: String(input.username ?? ''),
      email: String(input.email ?? ''),
      fullName: String(input.fullName ?? ''),
      fullNameAr: (input.fullNameAr as string) || null,
      phone: (input.phone as string) || null,
      status: String(input.status ?? 'active'),
      roleId: (input.role as { _id?: string })?._id ?? null,
      organizationId: (input.organization as { _id?: string })?._id ?? null,
      branchId: (input.branch as { _id?: string })?._id ?? null,
      departmentId: (input.department as { _id?: string })?._id ?? null,
      notes: (input.notes as string) || null,
      isDeleted: false,
      deletedAt: null,
      createdAt: now(),
      updatedAt: now(),
    }
    data.users.push(item)
    saveData(data)
    return item
  }

  updateUser(id: string, changes: Record<string, unknown>): DevUser {
    const data = ensureSeeded()
    const item = data.users.find((u) => u._id === id)
    if (!item) throw new Error('Not found')
    if (changes.role && typeof changes.role === 'object') {
      changes.roleId = (changes.role as { _id: string })._id
      delete changes.role
    } else if (changes.role === null) {
      changes.roleId = null
      delete changes.role
    }
    if (changes.organization && typeof changes.organization === 'object') {
      changes.organizationId = (changes.organization as { _id: string })._id
      delete changes.organization
    }
    if (changes.branch && typeof changes.branch === 'object') {
      changes.branchId = (changes.branch as { _id: string })._id
      delete changes.branch
    }
    if (changes.department && typeof changes.department === 'object') {
      changes.departmentId = (changes.department as { _id: string })._id
      delete changes.department
    }
    delete changes.password
    delete changes.passwordHash
    Object.assign(item, changes, { updatedAt: now() })
    saveData(data)
    return item
  }

  archiveUser(id: string): boolean {
    const data = ensureSeeded()
    const item = data.users.find((u) => u._id === id)
    if (!item || item.isDeleted) return false
    item.isDeleted = true
    item.deletedAt = now()
    saveData(data)
    return true
  }

  restoreUser(id: string): boolean {
    const data = ensureSeeded()
    const item = data.users.find((u) => u._id === id)
    if (!item || !item.isDeleted) return false
    item.isDeleted = false
    item.deletedAt = null
    saveData(data)
    return true
  }

  createRole(input: Record<string, unknown>): DevRole {
    const data = ensureSeeded()
    const perms = input.permissions as Array<{ _id: string }> | undefined
    const item: DevRole = {
      _id: newId(),
      code: String(input.code ?? ''),
      name: String(input.name ?? ''),
      nameAr: (input.nameAr as string) || null,
      description: (input.description as string) || null,
      isSystem: Boolean(input.isSystem),
      permissionIds: perms?.map((p) => p._id) ?? [],
      isDeleted: false,
      deletedAt: null,
      createdAt: now(),
      updatedAt: now(),
    }
    data.roles.push(item)
    saveData(data)
    return item
  }

  updateRole(id: string, changes: Record<string, unknown>): DevRole {
    const data = ensureSeeded()
    const item = data.roles.find((r) => r._id === id)
    if (!item) throw new Error('Not found')
    if (changes.permissions && Array.isArray(changes.permissions)) {
      changes.permissionIds = (changes.permissions as Array<{ _id: string }>).map((p) => p._id)
      delete changes.permissions
    }
    Object.assign(item, changes, { updatedAt: now() })
    saveData(data)
    return item
  }

  archiveRole(id: string): boolean {
    const data = ensureSeeded()
    const item = data.roles.find((r) => r._id === id)
    if (!item || item.isDeleted || item.isSystem) return false
    item.isDeleted = true
    item.deletedAt = now()
    saveData(data)
    return true
  }

  restoreRole(id: string): boolean {
    const data = ensureSeeded()
    const item = data.roles.find((r) => r._id === id)
    if (!item || !item.isDeleted) return false
    item.isDeleted = false
    item.deletedAt = null
    saveData(data)
    return true
  }

  resolveOrganization(org: DevOrg): Record<string, unknown> {
    return { ...org }
  }

  resolveBranch(branch: DevBranch): Record<string, unknown> {
    const data = ensureSeeded()
    return {
      ...branch,
      organization: data.organizations.find((o) => o._id === branch.organizationId) ?? null,
    }
  }

  resolveDepartment(dept: DevDepartment): Record<string, unknown> {
    const data = ensureSeeded()
    return {
      ...dept,
      branch: data.branches.find((b) => b._id === dept.branchId) ?? null,
      manager: dept.managerId ? data.users.find((u) => u._id === dept.managerId) ?? null : null,
    }
  }

  resolvePosition(pos: DevPosition): Record<string, unknown> {
    const data = ensureSeeded()
    return {
      ...pos,
      department: data.departments.find((d) => d._id === pos.departmentId) ?? null,
    }
  }

  resolveUser(user: DevUser): Record<string, unknown> {
    const data = ensureSeeded()
    return {
      ...user,
      role: user.roleId ? data.roles.find((r) => r._id === user.roleId) ?? null : null,
      organization: user.organizationId ? data.organizations.find((o) => o._id === user.organizationId) ?? null : null,
      branch: user.branchId ? data.branches.find((b) => b._id === user.branchId) ?? null : null,
      department: user.departmentId ? data.departments.find((d) => d._id === user.departmentId) ?? null : null,
    }
  }

  resolveRole(role: DevRole): Record<string, unknown> {
    const data = ensureSeeded()
    return {
      ...role,
      permissions: data.permissions.filter((p) => role.permissionIds.includes(p._id)),
      permissionCount: role.permissionIds.length,
    }
  }
}

export const devOrganizationService = new DevOrganizationService()
