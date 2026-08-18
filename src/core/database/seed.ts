/**
 * Seed — idempotent development database seeding.
 *
 * All writes go through repositories (never direct Realm access). The whole
 * seed runs inside a single transaction so it either applies fully or not at
 * all. Seeding is skipped when any organization already exists and is never
 * triggered in production by {@link DatabaseManager}.
 */

import type Realm from 'realm'

import { MODULE_RESOURCES, APPROVAL_MODULES, SYSTEM_ROLES } from '../../config/permissions.config'
import { AuditAction, AuditOutcome } from '../models/AuditLog'
import { buildPermissionCode } from '../models/Permission'
import { AuditRepository } from '../repositories/AuditRepository'
import { BranchRepository } from '../repositories/BranchRepository'
import { DepartmentRepository } from '../repositories/DepartmentRepository'
import { NotificationRepository } from '../repositories/NotificationRepository'
import { OrganizationRepository } from '../repositories/OrganizationRepository'
import { PermissionRepository } from '../repositories/PermissionRepository'
import { RoleRepository } from '../repositories/RoleRepository'
import { UserRepository } from '../repositories/UserRepository'
import { hashPassword } from '../security/encryption'
import { withTransaction } from './transactions'

export interface SeedSummary {
  organizations: number
  branches: number
  departments: number
  permissions: number
  roles: number
  users: number
  notifications: number
  auditEntries: number
}

export interface SeedResult {
  seeded: boolean
  summary: SeedSummary
}

const EMPTY_SUMMARY: SeedSummary = {
  organizations: 0,
  branches: 0,
  departments: 0,
  permissions: 0,
  roles: 0,
  users: 0,
  notifications: 0,
  auditEntries: 0,
}

const BASE_ACTIONS = ['view', 'create', 'update', 'delete'] as const

export function seedDatabase(realm: Realm): SeedResult {
  const organizationRepo = new OrganizationRepository()
  const branchRepo = new BranchRepository()
  const departmentRepo = new DepartmentRepository()
  const permissionRepo = new PermissionRepository()
  const roleRepo = new RoleRepository()
  const userRepo = new UserRepository()
  const notificationRepo = new NotificationRepository()
  const auditRepo = new AuditRepository()

  if (organizationRepo.count({ includeDeleted: true }) > 0) {
    return { seeded: false, summary: EMPTY_SUMMARY }
  }

  const summary: SeedSummary = { ...EMPTY_SUMMARY }

  withTransaction(realm, () => {
    const organization = organizationRepo.create({
      code: 'ORG-001',
      name: 'AL-ANSARI Holdings',
      nameAr: 'مجموعة الأنصاري',
      taxNumber: '310000000000003',
      registrationNumber: '1010000000',
      currency: 'SAR',
      timezone: 'Asia/Riyadh',
      language: 'ar',
      email: 'info@al-ansari.local',
    })
    summary.organizations += 1

    const headOffice = branchRepo.create({
      code: 'HQ',
      name: 'Head Office',
      nameAr: 'المكتب الرئيسي',
      organization,
      city: 'Riyadh',
    })
    summary.branches += 1

    const departments = [
      { code: 'ADMIN', name: 'Administration', nameAr: 'الإدارة العامة' },
      { code: 'FIN', name: 'Finance', nameAr: 'المالية' },
      { code: 'HR', name: 'Human Resources', nameAr: 'الموارد البشرية' },
      { code: 'IT', name: 'Information Technology', nameAr: 'تقنية المعلومات' },
    ]
    const departmentRecords = departments.map((department) => {
      summary.departments += 1
      return departmentRepo.create({ ...department, branch: headOffice })
    })

    // Generate all permission codes from the centralized config
    const permissionCodes = new Set<string>()
    for (const [module, resources] of Object.entries(MODULE_RESOURCES)) {
      for (const resource of resources) {
        for (const action of BASE_ACTIONS) {
          permissionCodes.add(buildPermissionCode(module, resource, action))
        }
        // Add approve action for approval-enabled modules
        if (APPROVAL_MODULES.has(module as keyof typeof MODULE_RESOURCES)) {
          permissionCodes.add(buildPermissionCode(module, resource, 'approve'))
        }
      }
    }

    const permissions = Array.from(permissionCodes).map((code) => {
      summary.permissions += 1
      return permissionRepo.create({
        code,
        name: code,
        module: code.split('.')[0] ?? '',
        resource: code.split('.')[1] ?? '',
        action: code.split('.')[2] ?? '',
      })
    })

    // Create all system roles from the centralized config
    for (const roleConfig of SYSTEM_ROLES) {
      const rolePermissions = permissions.filter((p) =>
        roleConfig.permissionFilter(p.module, p.resource, p.action),
      )
      roleRepo.create({
        code: roleConfig.code,
        name: roleConfig.name,
        nameAr: roleConfig.nameAr,
        description: roleConfig.description,
        isSystem: true,
        permissions: rolePermissions,
      })
      summary.roles += 1
    }

    // Find the Administrator role for the admin user
    const adminRole = roleRepo.findByCode('ADMINISTRATOR')
    if (!adminRole) {
      throw new Error('Administrator role not found after seeding')
    }

    const adminUser = userRepo.create({
      username: 'admin',
      email: 'admin@al-ansari.local',
      passwordHash: hashPassword('admin'),
      fullName: 'System Administrator',
      fullNameAr: 'مدير النظام',
      role: adminRole,
      organization,
      branch: headOffice,
      department: departmentRecords[0],
      mustChangePassword: false,
    })
    summary.users += 1

    notificationRepo.create({
      userId: adminUser._id,
      title: 'Welcome to AL-ANSARI ERP',
      titleAr: 'مرحباً بك في نظام الأنصاري',
      body: 'Your account is ready. Please change your password on first login.',
      bodyAr: 'حسابك جاهز. يرجى تغيير كلمة المرور عند أول تسجيل دخول.',
    })
    summary.notifications += 1

    auditRepo.create({
      action: AuditAction.Seed,
      module: 'system',
      resourceType: 'Database',
      resourceId: organization._id,
      summary: 'Seeded default database data',
      outcome: AuditOutcome.Success,
      actorUserId: adminUser._id,
      actorUsername: adminUser.username,
    })
    summary.auditEntries += 1
  })

  return { seeded: true, summary }
}
