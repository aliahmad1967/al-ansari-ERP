/**
 * DevAuthService — browser-compatible auth service for local development.
 *
 * Uses localStorage as a lightweight data store and Web Crypto API (PBKDF2)
 * for password hashing. Provides the same interface as AuthService so the
 * useAuth hook can fall back to it when Realm is unavailable (browser dev).
 *
 * This service is ONLY used when the Realm-native AuthService cannot load.
 * In production (Electron/desktop), the real AuthService with Realm is used.
 */

import type { ChangePasswordResult, LoginCredentials, LoginResult, SessionUser } from '@/types/auth'
import type { Session } from '@/types/auth'
import { STORAGE_KEYS } from '@/config/app.config'

const DEV_STORAGE_KEY = 'erp_dev_users'
const DEV_SEEDED_KEY = 'erp_dev_seeded'

interface DevUser {
  id: string
  username: string
  email: string
  passwordHash: string
  fullName: string
  fullNameAr: string
  roleCode: string
  roleName: string
  roleNameAr: string
  status: 'active' | 'inactive' | 'suspended'
  mustChangePassword: boolean
}

// ── PBKDF2 hashing via Web Crypto API ───────────────────────────────────────

async function deriveKey(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as unknown as BufferSource, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    256,
  )
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = await deriveKey(password, salt)
  const saltHex = bufferToHex(salt.buffer)
  const hashHex = bufferToHex(hash)
  return `pbkdf2$${saltHex}$${hashHex}`
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, hashHex] = stored.split('$')
  if (scheme !== 'pbkdf2' || !saltHex || !hashHex) return false

  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((h) => parseInt(h, 16)))
  const derived = await deriveKey(password, salt)
  const derivedHex = bufferToHex(derived)

  // Constant-time comparison
  if (derivedHex.length !== hashHex.length) return false
  let result = 0
  for (let i = 0; i < derivedHex.length; i++) {
    result |= derivedHex.charCodeAt(i) ^ hashHex.charCodeAt(i)
  }
  return result === 0
}

// ── Dev user store (localStorage) ────────────────────────────────────────────

function loadUsers(): DevUser[] {
  try {
    const raw = localStorage.getItem(DEV_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveUsers(users: DevUser[]): void {
  localStorage.setItem(DEV_STORAGE_KEY, JSON.stringify(users))
}

// ── Seed admin user (runs once) ──────────────────────────────────────────────

const ADMIN_PERMISSIONS = [
  'hr.employee.view', 'hr.employee.create', 'hr.employee.update', 'hr.employee.delete',
  'hr.attendance.view', 'hr.attendance.create', 'hr.attendance.update', 'hr.attendance.delete',
  'hr.leave.view', 'hr.leave.create', 'hr.leave.update', 'hr.leave.delete', 'hr.leave.approve',
  'hr.payroll.view', 'hr.payroll.create', 'hr.payroll.update',
  'hr.recruitment.view', 'hr.recruitment.create', 'hr.recruitment.update', 'hr.recruitment.delete',
  'finance.invoice.view', 'finance.invoice.create', 'finance.invoice.update', 'finance.invoice.delete',
  'finance.payment.view', 'finance.payment.create', 'finance.payment.update', 'finance.payment.delete',
  'finance.voucher.view', 'finance.voucher.create', 'finance.voucher.update',
  'finance.account.view', 'finance.account.create', 'finance.account.update',
  'finance.budget.view', 'finance.budget.create', 'finance.budget.update',
  'inventory.product.view', 'inventory.product.create', 'inventory.product.update', 'inventory.product.delete',
  'inventory.category.view', 'inventory.category.create', 'inventory.category.update', 'inventory.category.delete',
  'inventory.warehouse.view', 'inventory.warehouse.create', 'inventory.warehouse.update',
  'inventory.stock.view', 'inventory.stock.create', 'inventory.stock.update',
  'inventory.adjustment.view', 'inventory.adjustment.create', 'inventory.adjustment.update',
  'procurement.purchase-order.view', 'procurement.purchase-order.create', 'procurement.purchase-order.update', 'procurement.purchase-order.delete',
  'procurement.supplier.view', 'procurement.supplier.create', 'procurement.supplier.update', 'procurement.supplier.delete',
  'procurement.goods-receipt.view', 'procurement.goods-receipt.create', 'procurement.goods-receipt.update',
  'procurement.request.view', 'procurement.request.create', 'procurement.request.update',
  'sales.customer.view', 'sales.customer.create', 'sales.customer.update', 'sales.customer.delete',
  'sales.sales-order.view', 'sales.sales-order.create', 'sales.sales-order.update', 'sales.sales-order.delete',
  'sales.delivery.view', 'sales.delivery.create', 'sales.delivery.update',
  'sales.quotation.view', 'sales.quotation.create', 'sales.quotation.update', 'sales.quotation.delete',
  'sales.invoice.view', 'sales.invoice.create', 'sales.invoice.update', 'sales.invoice.delete',
  'assets.asset.view', 'assets.asset.create', 'assets.asset.update', 'assets.asset.delete',
  'assets.asset-category.view', 'assets.asset-category.create', 'assets.asset-category.update', 'assets.asset-category.delete',
  'assets.maintenance.view', 'assets.maintenance.create', 'assets.maintenance.update',
  'projects.project.view', 'projects.project.create', 'projects.project.update', 'projects.project.delete',
  'projects.task.view', 'projects.task.create', 'projects.task.update', 'projects.task.delete',
  'projects.milestone.view', 'projects.milestone.create', 'projects.milestone.update',
  'projects.timesheet.view', 'projects.timesheet.create', 'projects.timesheet.update',
  'organization.organization.view', 'organization.organization.update',
  'organization.branch.view', 'organization.branch.create', 'organization.branch.update', 'organization.branch.delete',
  'organization.department.view', 'organization.department.create', 'organization.department.update', 'organization.department.delete',
  'organization.user.view', 'organization.user.create', 'organization.user.update', 'organization.user.delete',
  'organization.role.view', 'organization.role.create', 'organization.role.update', 'organization.role.delete',
  'organization.permission.view',
  'settings.system.view', 'settings.system.update',
  'settings.security.view',
  'settings.backup.view', 'settings.backup.create',
  'reports.report.view', 'reports.report.create',
  'notifications.notification.view', 'notifications.notification.create', 'notifications.notification.update', 'notifications.notification.delete',
]

async function seedDevAdmin(): Promise<void> {
  if (localStorage.getItem(DEV_SEEDED_KEY)) return

  const users = loadUsers()
  if (users.some((u) => u.username === 'admin')) {
    localStorage.setItem(DEV_SEEDED_KEY, 'true')
    return
  }

  const passwordHash = await hashPassword('admin')
  users.push({
    id: 'dev-admin-001',
    username: 'admin',
    email: 'admin@al-ansari.local',
    passwordHash,
    fullName: 'System Administrator',
    fullNameAr: 'مدير النظام',
    roleCode: 'ADMINISTRATOR',
    roleName: 'Administrator',
    roleNameAr: 'مدير النظام',
    status: 'active',
    mustChangePassword: false,
  })

  saveUsers(users)
  localStorage.setItem(DEV_SEEDED_KEY, 'true')
}

// ── Public API ───────────────────────────────────────────────────────────────

export class DevAuthService {
  login(credentials: LoginCredentials): Promise<LoginResult> {
    return this._login(credentials)
  }

  private async _login(credentials: LoginCredentials): Promise<LoginResult> {
    await seedDevAdmin()

    const { username, password } = credentials
    const users = loadUsers()
    const user = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.status === 'active',
    )

    if (!user) {
      return { success: false, mustChangePassword: false, error: 'auth.invalidCredentials' }
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      return { success: false, mustChangePassword: false, error: 'auth.invalidCredentials' }
    }

    const sessionUser: SessionUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      fullNameAr: user.fullNameAr,
      roleId: null,
      roleCode: user.roleCode,
      roleName: user.roleName,
      roleNameAr: user.roleNameAr,
      organizationId: null,
      branchId: null,
      departmentId: null,
      mustChangePassword: user.mustChangePassword,
    }

    const permissionCodes =
      user.roleCode === 'ADMINISTRATOR' ? ADMIN_PERMISSIONS : []

    const now = Date.now()
    const session: Session = {
      user: sessionUser,
      permissionCodes,
      loginAt: now,
      expiresAt: now + 30 * 60 * 1000,
    }

    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session))

    return { success: true, mustChangePassword: user.mustChangePassword }
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.session)
  }

  changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<ChangePasswordResult> {
    return this._changePassword(userId, oldPassword, newPassword)
  }

  private async _changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<ChangePasswordResult> {
    const users = loadUsers()
    const user = users.find((u) => u.id === userId)
    if (!user) {
      return { success: false, error: 'auth.userNotFound' }
    }

    const valid = await verifyPassword(oldPassword, user.passwordHash)
    if (!valid) {
      return { success: false, error: 'auth.invalidCurrentPassword' }
    }

    user.passwordHash = await hashPassword(newPassword)
    user.mustChangePassword = false
    saveUsers(users)

    // Update session
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.session)
      if (raw) {
        const session: Session = JSON.parse(raw)
        session.user.mustChangePassword = false
        localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session))
      }
    } catch {
      // ignore
    }

    return { success: true }
  }

  getCurrentSession(): Session | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.session)
      if (!raw) return null
      const session: Session = JSON.parse(raw)
      if (!session.user || !session.permissionCodes || !session.expiresAt) return null
      if (Date.now() > session.expiresAt) {
        localStorage.removeItem(STORAGE_KEYS.session)
        return null
      }
      return session
    } catch {
      localStorage.removeItem(STORAGE_KEYS.session)
      return null
    }
  }
}
