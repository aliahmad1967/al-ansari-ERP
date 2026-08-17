import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'
import { CircleCheck, CircleX, Info, TriangleAlert, X } from 'lucide-react'

import { cn } from '@/lib/cn'
import type { ToastItem, ToastTone } from '@/stores/notification.store'
import { dismissToast, getToasts, subscribeToasts } from '@/stores/notification.store'
import { useSyncExternalStore } from 'react'

export interface ToastProviderProps {
  /** Position of the toast stack on the screen. */
  position?: 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start'
}

const iconMap: Record<ToastTone, typeof Info> = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleX,
}

const toneClasses: Record<ToastTone, string> = {
  info: 'text-info-muted',
  success: 'text-success-muted',
  warning: 'text-warning-muted',
  danger: 'text-danger-muted',
}

const positionClasses: Record<NonNullable<ToastProviderProps['position']>, string> = {
  'bottom-end': 'bottom-4 end-4',
  'bottom-start': 'bottom-4 start-4',
  'top-end': 'top-4 end-4',
  'top-start': 'top-4 start-4',
}

function ToastCard({ toast }: { toast: ToastItem }) {
  const { t } = useTranslation('ui')
  const Icon = iconMap[toast.tone]

  return (
    <div
      role={toast.tone === 'danger' ? 'alert' : 'status'}
      className={cn(
        'pointer-events-auto flex w-full items-start gap-3 rounded-md border border-border bg-surface-overlay p-4 shadow-lg',
        'animate-[ds-slide-in-up_200ms_ease-out]',
      )}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', toneClasses[toast.tone])} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-content">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-sm text-content-muted">{toast.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => dismissToast(toast.id)}
        aria-label={t('dismiss')}
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-content-subtle transition-colors hover:bg-surface-sunken hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/40"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}

export function ToastViewport({ position = 'bottom-end' }: ToastProviderProps) {
  const toasts = useSyncExternalStore(subscribeToasts, getToasts)
  const { t } = useTranslation('ui')

  if (toasts.length === 0) return null

  return createPortal(
    <div
      className={cn(
        'pointer-events-none fixed z-toast flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0',
        positionClasses[position],
      )}
      aria-live="polite"
      aria-label={t('notifications')}
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} />
      ))}
    </div>,
    document.body,
  )
}

export function ToastProvider({ position }: ToastProviderProps) {
  return <ToastViewport position={position} />
}

export default ToastProvider
