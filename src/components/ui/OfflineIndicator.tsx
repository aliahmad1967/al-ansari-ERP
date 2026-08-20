import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { WifiOff, RefreshCw } from 'lucide-react'

import { useNetwork } from '@/hooks/useNetwork'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/cn'
import { registerServiceWorker } from '@/lib/service-worker'

/**
 * OfflineIndicator — a persistent banner that shows the current network status.
 *
 * Appears at the top of the viewport when the browser is offline.
 * Disappears automatically when connectivity is restored.
 * Shows a recovery toast when coming back online.
 * Includes a "Reconnect" button that rechecks connectivity and re-registers the SW.
 *
 * Architecture note:
 *   This component reads from the network store (via useNetwork hook).
 *   It does NOT access Realm or any database — purely a UI concern.
 */
export default function OfflineIndicator() {
  const { isOnline, confirmedOnline, recheck, preflight } = useNetwork()
  const { t } = useTranslation('common')
  const { success } = useToast()
  const wasOfflineRef = useRef(false)

  // Show recovery toast when transitioning from offline to online
  useEffect(() => {
    if (isOnline && wasOfflineRef.current) {
      // Run a preflight check to confirm actual connectivity before celebrating
      preflight().then((reachable) => {
        if (reachable) {
          success({
            title: t('offline.recovered'),
            duration: 4000,
          })
        }
      })
    }
    wasOfflineRef.current = !isOnline
  }, [isOnline, preflight, success, t])

  const handleReconnect = async () => {
    recheck()
    await registerServiceWorker()
  }

  if (isOnline) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed inset-x-0 top-0 z-toast flex items-center justify-center gap-2',
        'bg-warning px-4 py-2 text-sm font-medium text-warning-content',
        'shadow-md transition-all duration-300',
      )}
    >
      <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{t('offline.indicator')}</span>
      {!confirmedOnline && (
        <span className="ms-1 text-xs opacity-75">
          ({t('appLoading.offline')})
        </span>
      )}
      <button
        onClick={handleReconnect}
        className="ms-2 inline-flex items-center gap-1 rounded-md bg-warning-content/20 px-2 py-0.5 text-xs font-semibold text-warning-content transition-colors hover:bg-warning-content/30"
        aria-label={t('offline.reconnect')}
      >
        <RefreshCw className="h-3 w-3" aria-hidden="true" />
        {t('offline.reconnect')}
      </button>
    </div>
  )
}
