import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { Check, Minus } from 'lucide-react'

import { cn } from '@/lib/cn'

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size' | 'className'
> {
  label?: ReactNode
  /** Renders the mixed (indeterminate) state. */
  indeterminate?: boolean
  state?: 'default' | 'error'
  className?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { id, label, indeterminate = false, disabled, state = 'default', className, ...rest },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  const checkboxRef = (node: HTMLInputElement | null): void => {
    if (typeof ref === 'function') {
      ref(node)
    } else if (ref) {
      ref.current = node
    }
    if (node) {
      node.indeterminate = indeterminate
    }
  }

  return (
    <label
      htmlFor={inputId}
      className={cn(
        'inline-flex cursor-pointer select-none items-center gap-2 text-sm text-content',
        disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
        <input
          ref={checkboxRef}
          id={inputId}
          type="checkbox"
          disabled={disabled}
          data-indeterminate={indeterminate ? 'true' : 'false'}
          aria-checked={indeterminate ? 'mixed' : undefined}
          aria-invalid={state === 'error'}
          className="peer sr-only"
          {...rest}
        />
        <span
          aria-hidden="true"
          className={cn(
            'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors duration-150',
            state === 'error' ? 'border-danger' : 'border-border-strong',
            'peer-checked:border-primary peer-checked:bg-primary',
            'peer-data-[indeterminate=true]:border-primary peer-data-[indeterminate=true]:bg-primary',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-focus-ring/40 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface',
            'peer-disabled:cursor-not-allowed peer-disabled:opacity-60',
          )}
        >
          <Check
            className="hidden text-primary-content peer-checked:inline-block peer-data-[indeterminate=true]:hidden"
            strokeWidth={3}
          />
          <Minus
            className="hidden text-primary-content peer-data-[indeterminate=true]:inline-block"
            strokeWidth={3}
          />
        </span>
      </span>
      {label && <span>{label}</span>}
    </label>
  )
})

export default Checkbox
