import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'

import { cn } from '@/lib/cn'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useFocusTrap } from '@/hooks/useFocusTrap'

export type DrawerSide = 'start' | 'end'

export interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Inline-start (left in LTR / right in RTL) or inline-end. */
  side?: DrawerSide
  title?: ReactNode
  description?: ReactNode
  width?: string
  children?: ReactNode
  footer?: ReactNode
  className?: string
}

export function Drawer({
  open,
  onOpenChange,
  side = 'start',
  title,
  description,
  width = '20rem',
  children,
  footer,
  className,
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  const { t } = useTranslation('ui')

  const handleClose = (): void => {
    onOpenChange(false)
  }

  useFocusTrap(panelRef, { enabled: open, onEscape: handleClose })
  useClickOutside(panelRef, handleClose, open)

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  if (!open) return null

  const isRTL = typeof document !== 'undefined' && document.documentElement.dir === 'rtl'
  const slidesFromStart = (side === 'start') !== isRTL
  const slideClass = slidesFromStart
    ? 'animate-[ds-slide-in-left_200ms_ease-out]'
    : 'animate-[ds-slide-in-right_200ms_ease-out]'

  return createPortal(
    <div className="fixed inset-0 z-drawer">
      <div
        className="fixed inset-0 animate-[ds-fade-in_150ms_ease-out] bg-overlay"
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        style={{ width }}
        className={cn(
          'absolute inset-y-0 flex max-w-[calc(100vw-2rem)] flex-col bg-surface-overlay shadow-xl',
          side === 'start' ? 'start-0' : 'end-0',
          slideClass,
          className,
        )}
      >
        {(title || description) && (
          <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div className="min-w-0">
              {title && (
                <h2 id={titleId} className="text-base font-semibold text-content">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descriptionId} className="mt-0.5 text-sm text-content-muted">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label={t('close')}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-content-subtle transition-colors hover:bg-surface-sunken hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/40"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </header>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <footer className="flex items-center justify-end gap-3 border-t border-border px-5 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  )
}

export default Drawer
