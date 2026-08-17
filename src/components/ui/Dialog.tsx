import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'

import { cn } from '@/lib/cn'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useFocusTrap } from '@/hooks/useFocusTrap'

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl'

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: ReactNode
  description?: ReactNode
  size?: DialogSize
  hideCloseButton?: boolean
  /** Closes the dialog when the overlay is pressed. */
  closeOnOverlay?: boolean
  children?: ReactNode
  footer?: ReactNode
  className?: string
}

const sizeClasses: Record<DialogSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  size = 'md',
  hideCloseButton = false,
  closeOnOverlay = true,
  children,
  footer,
  className,
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  const { t } = useTranslation('ui')

  const handleClose = (): void => {
    onOpenChange(false)
  }

  useFocusTrap(panelRef, {
    enabled: open,
    onEscape: handleClose,
  })

  useClickOutside(panelRef, handleClose, open && closeOnOverlay)

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-modal overflow-y-auto">
      <div
        className="fixed inset-0 animate-[ds-fade-in_150ms_ease-out] bg-overlay"
        aria-hidden="true"
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={description ? descriptionId : undefined}
          className={cn(
            'relative w-full rounded-lg border border-border bg-surface-overlay shadow-2xl',
            'animate-[ds-zoom-in_150ms_ease-out]',
            sizeClasses[size],
            className,
          )}
        >
          {!hideCloseButton && (
            <button
              type="button"
              onClick={handleClose}
              aria-label={t('close')}
              className="absolute end-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-md text-content-subtle transition-colors hover:bg-surface-sunken hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/40"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}

          {(title || description) && (
            <header className="border-b border-border px-6 py-4">
              {title && (
                <h2 id={titleId} className="text-lg font-semibold text-content">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descriptionId} className="mt-1 text-sm text-content-muted">
                  {description}
                </p>
              )}
            </header>
          )}

          <div className="px-6 py-5">{children}</div>

          {footer && (
            <footer className="flex justify-end gap-3 border-t border-border px-6 py-4">
              {footer}
            </footer>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default Dialog
