import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { CircleCheck, CircleX, Info, TriangleAlert, X } from 'lucide-react'

import { cn } from '@/lib/cn'

export type AlertTone = 'info' | 'success' | 'warning' | 'danger'

export interface AlertProps {
  tone?: AlertTone
  title?: ReactNode
  children?: ReactNode
  /** When provided, renders a dismissible close button. */
  onClose?: () => void
  className?: string
}

const iconMap: Record<AlertTone, typeof Info> = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleX,
}

const classes: Record<AlertTone, string> = {
  info: 'border-info/30 bg-info-subtle text-info-muted',
  success: 'border-success/30 bg-success-subtle text-success-muted',
  warning: 'border-warning/30 bg-warning-subtle text-warning-muted',
  danger: 'border-danger/30 bg-danger-subtle text-danger-muted',
}

export function Alert({ tone = 'info', title, children, onClose, className }: AlertProps) {
  const { t } = useTranslation('ui')
  const Icon = iconMap[tone]

  return (
    <div
      role="alert"
      className={cn('flex items-start gap-3 rounded-md border p-4', classes[tone], className)}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />

      <div className="min-w-0 flex-1">
        {title && <p className="text-sm font-semibold">{title}</p>}
        {children && <div className="mt-0.5 text-sm opacity-90">{children}</div>}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={t('dismiss')}
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/40"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

export default Alert
