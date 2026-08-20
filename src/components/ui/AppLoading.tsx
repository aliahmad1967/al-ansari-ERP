import { useTranslation } from 'react-i18next'
import { Boxes } from 'lucide-react'

import Spinner from '@/components/ui/Spinner'
import { useDatabaseReady } from '@/hooks/useDatabaseReady'
import { useNetwork } from '@/hooks/useNetwork'
import { cn } from '@/lib/cn'

/**
 * AppLoading — full-screen loading overlay shown during database initialization.
 *
 * Displays while Realm is opening on first load or after a browser restart.
 * Includes network status feedback so the user knows if they're offline
 * while the database loads. Automatically disappears when the database
 * reports ready.
 *
 * Architecture note:
 *   This component reads from the database-ready store and network store.
 *   It does NOT access Realm directly — purely a UI concern.
 */
export default function AppLoading() {
  const { ready, initializing, error } = useDatabaseReady()
  const { isOnline } = useNetwork()
  const { t } = useTranslation('common')

  // Don't show when database is ready
  if (ready) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-toast flex flex-col items-center justify-center',
        'bg-surface text-content',
      )}
      role="status"
      aria-live="polite"
      aria-busy={initializing}
    >
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Logo */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-content shadow-lg">
          <Boxes className="h-8 w-8" aria-hidden="true" />
        </div>

        {/* Loading state */}
        {initializing && (
          <>
            <Spinner size={32} className="text-primary" />
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">{t('appLoading.initializing')}</h2>
              <p className="text-sm text-content-subtle">{t('appLoading.preparingData')}</p>
            </div>
          </>
        )}

        {/* Error state */}
        {error && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-error">{t('appLoading.error')}</h2>
            <p className="text-sm text-content-subtle">{error}</p>
          </div>
        )}

        {/* Waiting state (not yet initializing) */}
        {!initializing && !error && (
          <>
            <Spinner size={32} className="text-primary" />
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">{t('appLoading.starting')}</h2>
            </div>
          </>
        )}

        {/* Network status */}
        <div className="flex items-center gap-2 text-xs text-content-subtle">
          <span
            className={cn(
              'inline-block h-2 w-2 rounded-full',
              isOnline ? 'bg-success' : 'bg-warning',
            )}
            aria-hidden="true"
          />
          <span>{isOnline ? t('appLoading.online') : t('appLoading.offline')}</span>
        </div>
      </div>
    </div>
  )
}
