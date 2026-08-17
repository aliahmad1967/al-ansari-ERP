/**
 * useAuth — React hook for authentication operations.
 *
 * Provides login, logout, password change, and session state to components.
 * All business logic is delegated to AuthService; this hook only handles
 * React state management through the auth store.
 *
 * AuthService is dynamically imported so the Realm database layer is never
 * loaded into the browser bundle at module-initialization time.
 * When Realm is unavailable (browser dev), falls back to DevAuthService.
 */

import { useCallback, useEffect } from 'react'
import { useSyncExternalStore } from 'react'

import {
  getAuthState,
  subscribeAuth,
  hydrateSession,
  setAuthenticated,
  setUnauthenticated,
  setLoading,
  setError,
  clearError,
  startSessionTimer,
} from '@/stores/auth.store'
import type { LoginCredentials, LoginResult, ChangePasswordResult } from '@/types/auth'

interface AuthProvider {
  login(credentials: LoginCredentials): LoginResult | Promise<LoginResult>
  logout(): void
  changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): ChangePasswordResult | Promise<ChangePasswordResult>
  getCurrentSession(): import('@/types/auth').Session | null
}

let authProvider: AuthProvider | null = null

async function getAuthProvider(): Promise<AuthProvider> {
  if (authProvider) return authProvider

  // Try to load the real AuthService (requires Realm native module)
  try {
    const { AuthService } = await import('@/core/services/AuthService')
    authProvider = new AuthService()
    return authProvider
  } catch {
    // Realm unavailable (browser dev) — fall back to DevAuthService
  }

  // Fall back to browser-compatible dev auth
  const { DevAuthService } = await import('@/core/services/DevAuthService')
  authProvider = new DevAuthService()
  return authProvider
}

export interface UseAuthResult {
  /** Current authentication status. */
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated'
  /** The current session (null when not authenticated). */
  session: ReturnType<typeof getAuthState>['session']
  /** Current error message key (null when no error). */
  error: string | null
  /** Whether the user is authenticated. */
  isAuthenticated: boolean
  /** Whether an operation is in progress. */
  isLoading: boolean
  /** Whether the user must change their password. */
  mustChangePassword: boolean
  /** Authenticates the user. */
  login: (credentials: LoginCredentials) => Promise<LoginResult>
  /** Logs out the current user. */
  logout: () => Promise<void>
  /** Changes the current user's password. */
  changePassword: (
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) => Promise<ChangePasswordResult>
  /** Clears the current error. */
  clearError: () => void
}

export function useAuth(): UseAuthResult {
  const authState = useSyncExternalStore(subscribeAuth, getAuthState)

  // Hydrate session on mount (localStorage only, no Realm)
  useEffect(() => {
    hydrateSession()
    const session = getAuthState().session
    if (session) {
      startSessionTimer()
    }
  }, [])

  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResult> => {
    setLoading()
    try {
      const provider = await getAuthProvider()
      const result = await Promise.resolve(provider.login(credentials))

      if (result.success) {
        const session = provider.getCurrentSession()
        if (session) {
          setAuthenticated(session)
          startSessionTimer()
        }
      } else {
        setUnauthenticated(result.error)
      }

      return result
    } catch {
      setUnauthenticated('auth.error')
      return { success: false, mustChangePassword: false, error: 'auth.error' }
    }
  }, [])

  const logout = useCallback(async (): Promise<void> => {
    try {
      const provider = await getAuthProvider()
      provider.logout()
    } catch {
      // Logout should always clear local state even if audit fails
    }
    setUnauthenticated()
  }, [])

  const changePassword = useCallback(
    async (
      userId: string,
      oldPassword: string,
      newPassword: string,
    ): Promise<ChangePasswordResult> => {
      try {
        const provider = await getAuthProvider()
        const result = await Promise.resolve(provider.changePassword(userId, oldPassword, newPassword))
        if (!result.success) {
          setError(result.error ?? 'auth.changePasswordFailed')
        }
        return result
      } catch {
        setError('auth.changePasswordFailed')
        return { success: false, error: 'auth.changePasswordFailed' }
      }
    },
    [],
  )

  return {
    status: authState.status,
    session: authState.session,
    error: authState.error,
    isAuthenticated: authState.status === 'authenticated',
    isLoading: authState.status === 'loading',
    mustChangePassword: authState.session?.user.mustChangePassword ?? false,
    login,
    logout,
    changePassword,
    clearError,
  }
}
