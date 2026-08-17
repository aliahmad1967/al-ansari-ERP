import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/ui/Button'
import { cn } from '@/lib/cn'

export interface FormActionsProps {
  /** Submit button label. */
  submitLabel?: ReactNode
  /** Cancel button label. */
  cancelLabel?: ReactNode
  onSubmit?: () => void
  onCancel?: () => void
  submitLoading?: boolean
  submitDisabled?: boolean
  cancelDisabled?: boolean
  /** Renders the buttons at the inline-start instead of inline-end. */
  align?: 'start' | 'end'
  className?: string
  children?: ReactNode
}

/**
 * Standard form action bar (submit / cancel). Pass `children` to fully
 * override the default button rendering.
 */
export function FormActions({
  submitLabel,
  cancelLabel,
  onSubmit,
  onCancel,
  submitLoading = false,
  submitDisabled = false,
  cancelDisabled = false,
  align = 'end',
  className,
  children,
}: FormActionsProps) {
  const { t } = useTranslation('ui')

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3',
        align === 'end' ? 'justify-end' : 'justify-start',
        className,
      )}
    >
      {children ??
        (onSubmit || onCancel ? (
          <>
            {onCancel && (
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={cancelDisabled}
              >
                {cancelLabel ?? t('actions.cancel')}
              </Button>
            )}
            {onSubmit && (
              <Button
                type="button"
                onClick={onSubmit}
                loading={submitLoading}
                disabled={submitDisabled}
              >
                {submitLabel ?? t('actions.submit')}
              </Button>
            )}
          </>
        ) : null)}
    </div>
  )
}

export default FormActions
