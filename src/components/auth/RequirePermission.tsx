/**
 * RequirePermission — component guard that renders children only when
 * the user has the required permission. Otherwise renders a fallback.
 */

import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ShieldX } from 'lucide-react'

import { usePermissions } from '@/hooks/usePermissions'

export interface RequirePermissionProps {
  /** The required permission code (e.g., 'hr.employee.view'). */
  permission: string
  /** Content to render when the permission is granted. */
  children: ReactNode
  /** Content to render when the permission is denied. */
  fallback?: ReactNode
}

export function RequirePermission({ permission, children, fallback }: RequirePermissionProps) {
  const { t } = useTranslation('auth')
  const { can } = usePermissions()

  if (can(permission)) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <ShieldX className="mb-4 h-12 w-12 text-content-subtle" aria-hidden="true" />
      <h2 className="text-lg font-semibold text-content">{t('protectedRoute.unauthorized')}</h2>
      <p className="mt-1 text-sm text-content-subtle">{permission}</p>
    </div>
  )
}

/**
 * RequireRole — component guard that renders children only when
 * the user has one of the required role codes.
 */
export interface RequireRoleProps {
  /** The required role codes (any match grants access). */
  codes: string[]
  children: ReactNode
  fallback?: ReactNode
}

export function RequireRole({ codes, children, fallback }: RequireRoleProps) {
  const { t } = useTranslation('auth')
  const { hasRole } = usePermissions()

  if (hasRole(...codes)) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <ShieldX className="mb-4 h-12 w-12 text-content-subtle" aria-hidden="true" />
      <h2 className="text-lg font-semibold text-content">{t('protectedRoute.unauthorized')}</h2>
    </div>
  )
}
