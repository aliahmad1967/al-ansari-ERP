/**
 * Auth store — external store for authentication state.
 *
 * Uses the same useSyncExternalStore pattern as the rest of the application.
 * Persists session to localStorage through the security/session module.
 *
 * This store does NOT contain business logic — all service calls happen
 * through the useAuth hook which delegates to AuthService.
 */

import type { AuthState, Session } from '@/types/auth'
import { loadSession, clearSession, startExpirationTimer, stopExpirationTimer } from '@/core/security/session'

const listeners = new Set<() => void>()

let state: AuthState = {
  status: 'idle',
  session: loadSession(),
  error: null,
}

function setState(patch: Partial<AuthState>): void {
  state = { ...state, ...patch }
  emit()
}

function emit(): void {
  listeners.forEach((listener) => listener())
}

export function getAuthState(): AuthState {
  return state
}

export function subscribeAuth(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Called by useAuth on mount to hydrate the session. */
export function hydrateSession(): void {
  const session = loadSession()
  if (session) {
    setState({ status: 'authenticated', session, error: null })
  } else {
    setState({ status: 'unauthenticated', session: null, error: null })
  }
}

/** Called after a successful login. */
export function setAuthenticated(session: Session): void {
  setState({ status: 'authenticated', session, error: null })
  startExpirationTimer(() => {
    setState({ status: 'unauthenticated', session: null, error: null })
  })
}

/** Called after logout or session expiration. */
export function setUnauthenticated(error?: string): void {
  clearSession()
  stopExpirationTimer()
  setState({ status: 'unauthenticated', session: null, error: error ?? null })
}

/** Sets the loading state. */
export function setLoading(): void {
  setState({ status: 'loading' })
}

/** Sets an error message. */
export function setError(error: string): void {
  setState({ error })
}

/** Clears the current error. */
export function clearError(): void {
  setState({ error: null })
}

/** Updates the session (e.g., after password change). */
export function updateSession(session: Session): void {
  setState({ session })
}

/** Starts the session expiration timer for a restored session. */
export function startSessionTimer(): void {
  const session = state.session
  if (session) {
    startExpirationTimer(() => {
      setUnauthenticated('auth.sessionExpired')
    })
  }
}

/** Stops the session timer (e.g., on logout). */
export function stopSessionTimer(): void {
  stopExpirationTimer()
}
