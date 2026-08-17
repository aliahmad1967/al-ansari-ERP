/**
 * ProtectedRoute — route guard that redirects unauthenticated users to login
 * and blocks access to password change when already authenticated.
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { useAuth } from '@/hooks/useAuth'
import Spinner from '@/components/ui/Spinner'

export interface ProtectedRouteProps {
  /** When true, only authenticated users can access (default). */
  requireAuth?: boolean
  /** When true, only unauthenticated users can access (e.g., login page). */
  requireGuest?: boolean
}

export default function ProtectedRoute({
  requireAuth = false,
  requireGuest = false,
}: ProtectedRouteProps) {
  const { t } = useTranslation('auth')
  const { status, isAuthenticated, mustChangePassword } = useAuth()
  const location = useLocation()

  // Still loading session
  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8 text-primary" />
          <p className="text-sm text-content-subtle">{t('login.loading', { ns: 'common' })}</p>
        </div>
      </div>
    )
  }

  // Guest-only routes (login page): redirect authenticated users to home
  if (requireGuest) {
    if (isAuthenticated) {
      return <Navigate to="/" replace />
    }
    return <Outlet />
  }

  // Protected routes: redirect unauthenticated users to login
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Redirect to password change if required
  if (requireAuth && isAuthenticated && mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }

  return <Outlet />
}
