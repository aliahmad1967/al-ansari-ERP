/**
 * Session persistence — localStorage-backed session management with timeout.
 *
 * The session stores only what is needed to identify the authenticated user
 * and their permissions. Sensitive credentials (passwords) are never stored.
 *
 * Architecture note: This is the local/offline session layer. A future server
 * authorization layer can replace or augment this with JWT/session tokens
 * without changing the UI or hook layer.
 */

import { STORAGE_KEYS } from '@/config/app.config'
import type { Session } from '@/types/auth'
import { DEV_SEED_VERSION, getPermissionsForRole } from '@/core/security/devPermissions'

const SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes
const ACTIVITY_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes of inactivity

const DEV_SEED_VERSION_KEY = 'erp_dev_seed_version'

/**
 * Refreshes permission codes when the seed version changes.
 * This ensures newly added permissions in code are picked up
 * without requiring a re-login.
 */
function refreshPermissionsIfNeeded(session: Session): Session {
  const currentVersion = parseInt(localStorage.getItem(DEV_SEED_VERSION_KEY) ?? '0', 10)
  if (currentVersion !== DEV_SEED_VERSION) return session
  const expectedPermissions = getPermissionsForRole(session.user.roleCode)
  if (expectedPermissions.length === 0) return session
  const hasAll = expectedPermissions.every((p) =>
    session.permissionCodes.includes(p),
  )
  if (!hasAll) {
    session.permissionCodes = [...expectedPermissions]
    saveSession(session)
  }
  return session
}

let expirationTimer: ReturnType<typeof setTimeout> | null = null
let onExpireCallback: (() => void) | null = null

/**
 * Creates a new session with computed expiration.
 * Does NOT persist — call `saveSession` for that.
 */
export function createSession(
  user: Session['user'],
  permissionCodes: string[],
  timeoutMs: number = SESSION_TIMEOUT_MS,
): Session {
  const now = Date.now()
  return {
    user,
    permissionCodes,
    loginAt: now,
    expiresAt: now + timeoutMs,
  }
}

/** Persists a session to localStorage. */
export function saveSession(session: Session): void {
  try {
    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session))
  } catch {
    // Storage full or unavailable — fail silently
  }
}

/** Loads the stored session from localStorage, or null if absent/expired. */
export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.session)
    if (!raw) return null
    const session: Session = JSON.parse(raw)
    if (!session.user || !session.permissionCodes || !session.expiresAt) return null
    if (Date.now() > session.expiresAt) {
      clearSession()
      return null
    }
    return refreshPermissionsIfNeeded(session)
  } catch {
    clearSession()
    return null
  }
}

/** Removes the session from localStorage. */
export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.session)
  } catch {
    // ignore
  }
  stopExpirationTimer()
}

/**
 * Starts a timer that fires `onExpire` when the session expires.
 * If a timer is already running it is replaced.
 */
export function startExpirationTimer(onExpire: () => void): void {
  stopExpirationTimer()
  onExpireCallback = onExpire

  const session = loadSession()
  if (!session) return

  const remaining = session.expiresAt - Date.now()
  if (remaining <= 0) {
    onExpire()
    return
  }

  expirationTimer = setTimeout(() => {
    clearSession()
    onExpireCallback?.()
    onExpireCallback = null
  }, remaining)
}

/** Stops the running expiration timer. */
export function stopExpirationTimer(): void {
  if (expirationTimer !== null) {
    clearTimeout(expirationTimer)
    expirationTimer = null
  }
}

/**
 * Extends the session expiration on user activity.
 * Called by the activity tracking hook to implement sliding expiration.
 */
export function extendSession(timeoutMs: number = ACTIVITY_TIMEOUT_MS): void {
  const session = loadSession()
  if (!session) return

  session.expiresAt = Date.now() + timeoutMs
  saveSession(session)

  // Restart the timer with the new expiration
  if (onExpireCallback) {
    startExpirationTimer(onExpireCallback)
  }
}

/** Returns the remaining session time in milliseconds, or 0 if expired. */
export function getSessionRemainingTime(): number {
  const session = loadSession()
  if (!session) return 0
  return Math.max(0, session.expiresAt - Date.now())
}

/** Returns true when the current session is valid and not expired. */
export function isSessionValid(): boolean {
  const session = loadSession()
  return session !== null && Date.now() <= session.expiresAt
}
