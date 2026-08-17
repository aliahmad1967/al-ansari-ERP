/**
 * AuthService — business-layer facade for authentication operations.
 *
 * Responsibilities:
 *  - Credential verification (username + password)
 *  - Session creation and persistence
 *  - Password change (with mandatory-first-login support)
 *  - Audit trail for login/logout events
 *
 * Architecture note: This service operates on the local Realm database.
 * A future server authorization layer can implement the same interface
 * while delegating to a remote API instead of local Realm queries.
 */

import { SESSION_TIMEOUT_MS } from '@/config/app.config'
import type { ChangePasswordResult, LoginCredentials, LoginResult, SessionUser } from '@/types/auth'

import { AuditAction, AuditOutcome } from '../models/AuditLog'
import { UserStatus } from '../models/User'
import { AuditRepository } from '../repositories/AuditRepository'
import { UserRepository } from '../repositories/UserRepository'
import { verifyPassword, hashPassword } from '../security/encryption'
import {
  clearSession,
  createSession,
  loadSession,
  saveSession,
} from '../security/session'
import type { Session } from '@/types/auth'

export class AuthService {
  private readonly userRepo = new UserRepository()
  private readonly auditRepo = new AuditRepository()

  /**
   * Authenticates a user with username and password.
   * On success, creates and persists a session.
   * Returns the session user info and whether a password change is required.
   */
  login(credentials: LoginCredentials): LoginResult {
    const { username, password } = credentials

    // Find user by username (case-insensitive)
    const user = this.userRepo.findByUsername(username)
    if (!user) {
      this.recordLoginAttempt(username, false, 'User not found')
      return { success: false, mustChangePassword: false, error: 'auth.invalidCredentials' }
    }

    // Check account status
    if (user.status === UserStatus.Inactive) {
      this.recordLoginAttempt(username, false, 'Account inactive')
      return { success: false, mustChangePassword: false, error: 'auth.accountInactive' }
    }
    if (user.status === UserStatus.Suspended) {
      this.recordLoginAttempt(username, false, 'Account suspended')
      return { success: false, mustChangePassword: false, error: 'auth.accountSuspended' }
    }

    // Verify password
    if (!verifyPassword(password, user.passwordHash)) {
      this.recordLoginAttempt(username, false, 'Invalid password')
      return { success: false, mustChangePassword: false, error: 'auth.invalidCredentials' }
    }

    // Build session user
    const sessionUser: SessionUser = {
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      fullNameAr: user.fullNameAr,
      roleId: user.role?._id ?? null,
      roleCode: user.role?.code ?? null,
      roleName: user.role?.name ?? null,
      roleNameAr: user.role?.nameAr ?? null,
      organizationId: user.organization?._id ?? null,
      branchId: user.branch?._id ?? null,
      departmentId: user.department?._id ?? null,
      mustChangePassword: user.mustChangePassword,
    }

    // Collect permission codes from the user's role
    const permissionCodes: string[] = []
    if (user.role) {
      for (const permission of user.role.permissions) {
        permissionCodes.push(permission.code)
      }
    }

    // Create and persist session
    const session = createSession(sessionUser, permissionCodes, SESSION_TIMEOUT_MS)
    saveSession(session)

    // Record login
    this.userRepo.recordLogin(user._id)
    this.auditRepo.create({
      action: AuditAction.Login,
      module: 'auth',
      resourceType: 'User',
      resourceId: user._id,
      summary: `User "${username}" logged in successfully`,
      outcome: AuditOutcome.Success,
      actorUserId: user._id,
      actorUsername: username,
    })

    return { success: true, mustChangePassword: user.mustChangePassword }
  }

  /**
   * Logs out the current user: clears session, records audit event.
   */
  logout(): void {
    const session = loadSession()
    if (session) {
      this.auditRepo.create({
        action: AuditAction.Logout,
        module: 'auth',
        resourceType: 'User',
        resourceId: session.user.id,
        summary: `User "${session.user.username}" logged out`,
        outcome: AuditOutcome.Success,
        actorUserId: session.user.id,
        actorUsername: session.user.username,
      })
    }
    clearSession()
  }

  /**
   * Changes the password for a user. Verifies the old password first.
   * After changing, clears the mustChangePassword flag.
   */
  changePassword(userId: string, oldPassword: string, newPassword: string): ChangePasswordResult {
    const user = this.userRepo.findById(userId)
    if (!user) {
      return { success: false, error: 'auth.userNotFound' }
    }

    // Verify current password
    if (!verifyPassword(oldPassword, user.passwordHash)) {
      return { success: false, error: 'auth.invalidCurrentPassword' }
    }

    // Hash new password and update
    const newHash = hashPassword(newPassword)
    this.userRepo.changePassword(userId, newHash)

    // Update the session to reflect the change
    const session = loadSession()
    if (session && session.user.id === userId) {
      session.user.mustChangePassword = false
      saveSession(session)
    }

    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'auth',
      resourceType: 'User',
      resourceId: userId,
      summary: 'Password changed successfully',
      outcome: AuditOutcome.Success,
      actorUserId: userId,
      actorUsername: user.username,
    })

    return { success: true }
  }

  /**
   * Resets password without verifying the old password.
   * Used for admin-initiated password resets.
   */
  resetPassword(userId: string, newPassword: string): ChangePasswordResult {
    const user = this.userRepo.findById(userId)
    if (!user) {
      return { success: false, error: 'auth.userNotFound' }
    }

    const newHash = hashPassword(newPassword)
    this.userRepo.changePassword(userId, newHash)

    this.auditRepo.create({
      action: AuditAction.Update,
      module: 'auth',
      resourceType: 'User',
      resourceId: userId,
      summary: 'Password reset by administrator',
      outcome: AuditOutcome.Success,
    })

    return { success: true }
  }

  /**
   * Validates that the current session is still valid.
   * Returns the session if valid, null otherwise.
   */
  validateSession(): Session | null {
    const session = loadSession()
    if (!session) return null

    // Check expiration
    if (Date.now() > session.expiresAt) {
      clearSession()
      return null
    }

    // Verify user still exists and is active
    const user = this.userRepo.findById(session.user.id)
    if (!user || user.status !== UserStatus.Active) {
      clearSession()
      return null
    }

    return session
  }

  /**
   * Returns the current session without validation.
   * Use validateSession() for security checks.
   */
  getCurrentSession(): Session | null {
    return loadSession()
  }

  private recordLoginAttempt(
    username: string,
    success: boolean,
    reason: string,
  ): void {
    this.auditRepo.create({
      action: AuditAction.Login,
      module: 'auth',
      resourceType: 'User',
      summary: `Login attempt for "${username}": ${reason}`,
      outcome: success ? AuditOutcome.Success : AuditOutcome.Failure,
      actorUsername: username,
    })
  }
}
