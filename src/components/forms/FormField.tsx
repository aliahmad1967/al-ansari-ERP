import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  type ReactElement,
  type ReactNode,
} from 'react'
import { useTranslation } from 'react-i18next'
import { CircleAlert } from 'lucide-react'

import { cn } from '@/lib/cn'

export interface FormFieldProps {
  label: ReactNode
  /** Overrides the auto-generated control id. */
  id?: string
  htmlFor?: string
  required?: boolean
  error?: ReactNode
  hint?: ReactNode
  className?: string
  children: ReactNode
}

type InjectedProps = {
  id: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}

/**
 * Label + control + hint/error wrapper. Injects `id`, `aria-invalid` and
 * `aria-describedby` into a single child control when possible.
 */
export function FormField({
  label,
  id,
  htmlFor,
  required = false,
  error,
  hint,
  className,
  children,
}: FormFieldProps) {
  const { t } = useTranslation('ui')
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const errorId = `${fieldId}-error`
  const hintId = `${fieldId}-hint`

  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ')

  const control = (() => {
    const child = Children.only(children)
    if (!isValidElement(child)) return children

    const props: InjectedProps = { id: fieldId }
    if (error) props['aria-invalid'] = true
    if (describedBy) props['aria-describedby'] = describedBy

    return cloneElement(child as ReactElement<InjectedProps>, props)
  })()

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor ?? fieldId} className="text-sm font-medium text-content">
        {label}
        {required && (
          <span aria-hidden="true" className="ms-0.5 text-danger">
            *
          </span>
        )}
        {!required && (
          <span className="ms-1 text-xs font-normal text-content-subtle">({t('optional')})</span>
        )}
      </label>

      {control}

      {error && (
        <p id={errorId} className="flex items-center gap-1 text-sm text-danger" role="alert">
          <CircleAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      {hint && !error && (
        <p id={hintId} className="text-sm text-content-subtle">
          {hint}
        </p>
      )}
    </div>
  )
}

export default FormField
