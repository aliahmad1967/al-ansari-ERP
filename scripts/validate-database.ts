/**
 * validate-database — end-to-end verification of the Realm database layer.
 *
 * Exercises: open + seed, idempotency, repository CRUD, soft-delete,
 * validation, close/reopen persistence, export, backup and the guarded reset.
 * Exits 0 on success, 1 when any check fails.
 */

import fs from 'node:fs'
import path from 'node:path'

import { databaseManager } from '../src/core/database/database-manager'
import { DatabaseErrorCode, isDatabaseError } from '../src/core/database/errors'
import type { DatabaseErrorCodeValue } from '../src/core/database/errors'
import { CURRENT_SCHEMA_VERSION } from '../src/core/database/migrations'
import { Realm } from '../src/core/database/realm'
import { seedDatabase } from '../src/core/database/seed'
import { AuditRepository } from '../src/core/repositories/AuditRepository'
import { BranchRepository } from '../src/core/repositories/BranchRepository'
import { DepartmentRepository } from '../src/core/repositories/DepartmentRepository'
import { NotificationRepository } from '../src/core/repositories/NotificationRepository'
import { OrganizationRepository } from '../src/core/repositories/OrganizationRepository'
import { PermissionRepository } from '../src/core/repositories/PermissionRepository'
import { RoleRepository, SystemRoleCode } from '../src/core/repositories/RoleRepository'
import { UserRepository } from '../src/core/repositories/UserRepository'
import { hashPassword, verifyPassword } from '../src/core/security/encryption'

const TEST_DB_PATH = path.resolve('data', 'validation.realm')

let passed = 0
let failed = 0

function check(name: string, condition: boolean): void {
  if (condition) {
    passed += 1
    console.log(`  PASS  ${name}`)
  } else {
    failed += 1
    console.log(`  FAIL  ${name}`)
  }
}

function checkThrows(name: string, fn: () => void, expectedCode: DatabaseErrorCodeValue): void {
  try {
    fn()
    failed += 1
    console.log(`  FAIL  ${name} (expected error ${expectedCode}, none thrown)`)
  } catch (error) {
    if (isDatabaseError(error) && error.code === expectedCode) {
      passed += 1
      console.log(`  PASS  ${name}`)
    } else {
      failed += 1
      console.log(`  FAIL  ${name}: ${String(error)}`)
    }
  }
}

function section(title: string): void {
  console.log(`\n== ${title} ==`)
}

function removeTestDatabase(): void {
  for (const suffix of ['', '.lock', '.management', '.note']) {
    const filePath = TEST_DB_PATH + suffix
    if (fs.existsSync(filePath)) {
      fs.rmSync(filePath, { force: true, recursive: true })
    }
  }
}

async function main(): Promise<void> {
  removeTestDatabase()
  if (fs.existsSync(TEST_DB_PATH)) {
    console.error('Unable to clean the previous test database. Aborting.')
    process.exit(1)
  }

  const orgRepo = new OrganizationRepository()
  const branchRepo = new BranchRepository()
  const departmentRepo = new DepartmentRepository()
  const permissionRepo = new PermissionRepository()
  const roleRepo = new RoleRepository()
  const userRepo = new UserRepository()
  const notificationRepo = new NotificationRepository()
  const auditRepo = new AuditRepository()

  section('Open and seed')
  const realm = await databaseManager.open({
    path: TEST_DB_PATH,
    deleteRealmIfMigrationNeeded: true,
    seed: true,
  })
  check('database is open', databaseManager.isOpen)
  check('schema version matches', realm.schemaVersion === CURRENT_SCHEMA_VERSION)
  check('seed ran', databaseManager.seedResult?.seeded === true)
  check('one organization seeded', orgRepo.count() === 1)
  check('seed is idempotent', seedDatabase(realm).seeded === false)

  section('Seed data through repositories')
  const organization = orgRepo.getDefault()
  check('default organization found', organization?.code === 'ORG-001')
  const branch = branchRepo.findByCode('HQ')
  check(
    'head office branch found',
    branch?.code === 'HQ' && branch.organization._id === organization?._id,
  )
  check('four departments seeded', departmentRepo.findByBranch(branch!._id).length === 4)
  const permission = permissionRepo.findByCode('hr.employee.view')
  check('permission found', permission?.code === 'hr.employee.view')
  check('permissions per module', permissionRepo.findByModule('finance').length > 0)
  const adminRole = roleRepo.findByCode(SystemRoleCode.Administrator)
  check('administrator role found', adminRole?.isSystem === true)
  check('administrator has permissions', (adminRole?.permissions.length ?? 0) > 0)
  const adminUser = userRepo.findByUsername('admin')
  const adminUserId = adminUser!._id
  check('admin user found', adminUser?.username === 'admin')
  check('admin role assigned', adminUser?.role?._id === adminRole?._id)
  check(
    'password hashes and verifies',
    verifyPassword('Admin@12345', adminUser!.passwordHash) === true,
  )
  check('wrong password rejected', verifyPassword('nope', adminUser!.passwordHash) === false)
  check('welcome notification unread', notificationRepo.countUnread(adminUserId) === 1)
  check('audit trail recorded', auditRepo.findRecent().length >= 1)

  section('Repository CRUD')
  const orgTest = orgRepo.create({
    code: 'ORG-T',
    name: 'Test Organization',
    currency: 'SAR',
    timezone: 'UTC',
    language: 'en',
  })
  const orgTestId = orgTest._id
  check('create returns managed object', typeof orgTestId === 'string')
  check('exists() after create', orgRepo.exists(orgTestId) === true)

  const renamed = orgRepo.update(orgTestId, { name: 'Test Organization (Updated)' })
  check('update applied', renamed.name === 'Test Organization (Updated)')
  check('updatedAt touched', renamed.updatedAt >= renamed.createdAt)

  checkThrows(
    'duplicate code rejected',
    () =>
      orgRepo.create({
        code: 'ORG-001',
        name: 'Duplicate',
        currency: 'SAR',
        timezone: 'UTC',
        language: 'en',
      }),
    DatabaseErrorCode.DB_VALIDATION_FAILED,
  )

  section('Soft delete and restore')
  orgRepo.softDelete(orgTestId)
  check('soft-deleted hidden from findAll', orgRepo.findById(orgTestId) === null)
  check(
    'soft-deleted visible with includeDeleted',
    orgRepo.findByIdIncludingDeleted(orgTestId) !== null,
  )
  orgRepo.restore(orgTestId)
  check('restore brings record back', orgRepo.findById(orgTestId) !== null)
  check(
    'hard delete removes record',
    orgRepo.delete(orgTestId) === true && orgRepo.exists(orgTestId) === false,
  )

  section('User maintenance flows')
  userRepo.recordLogin(adminUserId)
  check('login recorded', (userRepo.findById(adminUserId)?.lastLoginAt ?? null) !== null)
  userRepo.changePassword(adminUserId, hashPassword('NewPass@123'))
  check(
    'password changed',
    verifyPassword('NewPass@123', userRepo.findByIdIncludingDeleted(adminUserId)!.passwordHash) ===
      true,
  )

  section('Notifications')
  const notification = notificationRepo.findUnread(adminUserId)[0]
  check('unread notification found', notification !== undefined)
  notificationRepo.markRead(notification!._id)
  check('markRead applied', notificationRepo.findById(notification!._id)?.isRead === true)
  check('unread count dropped', notificationRepo.countUnread(adminUserId) === 0)

  section('Close and reopen (persistence)')
  const renamedBranch = branchRepo.update(branch!._id, { name: 'Head Office - Riyadh' })
  check('branch renamed', renamedBranch.name === 'Head Office - Riyadh')

  databaseManager.close()
  check('database closed', !databaseManager.isOpen)
  check(
    'getRealm throws when closed',
    (() => {
      try {
        databaseManager.getRealm()
        return false
      } catch {
        return true
      }
    })(),
  )

  const reopened = await databaseManager.open({ path: TEST_DB_PATH })
  check('reopened', databaseManager.isOpen && reopened.isClosed === false)
  check('no duplicate seed on reopen', orgRepo.count() === 1)
  check('organization persisted', orgRepo.getDefault()?.code === 'ORG-001')
  check('admin user persisted', userRepo.findByUsername('admin') !== null)
  check('branch rename persisted', branchRepo.findByCode('HQ')?.name === 'Head Office - Riyadh')
  check(
    'changed password persisted',
    verifyPassword('NewPass@123', userRepo.findByUsername('admin')!.passwordHash) === true,
  )
  check('notification read state persisted', notificationRepo.countUnread(adminUserId) === 0)

  section('Export and backup')
  const exported = databaseManager.exportJson()
  check('export contains organizations', exported.includes('Organization'))
  check('export contains admin user', exported.includes('admin@al-ansari.local'))
  const backupPath = databaseManager.backup()
  check('backup file created', fs.existsSync(backupPath))

  section('Reset guards')
  checkThrows(
    'wrong token blocked',
    () => databaseManager.reset({ confirm: 'WRONG' }),
    DatabaseErrorCode.DB_RESET_BLOCKED,
  )
  const previousEnv = process.env.NODE_ENV
  process.env.NODE_ENV = 'production'
  checkThrows(
    'production reset blocked',
    () => databaseManager.reset({ confirm: 'RESET' }),
    DatabaseErrorCode.DB_RESET_BLOCKED,
  )
  process.env.NODE_ENV = previousEnv

  databaseManager.reset({ confirm: 'RESET' })
  check('reset deleted the database file', !fs.existsSync(TEST_DB_PATH))
  check('manager closed after reset', !databaseManager.isOpen)

  section('Cleanup')
  removeTestDatabase()
  check(
    'test files removed',
    !fs.existsSync(TEST_DB_PATH) && !fs.existsSync(TEST_DB_PATH + '.lock'),
  )
  Realm.shutdown()

  console.log(`\n${passed} passed, ${failed} failed`)
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((error) => {
  console.error('Validation crashed:', error)
  process.exit(1)
})
