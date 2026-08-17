import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

import { cn } from '@/lib/cn'

export type InputSize = 'sm' | 'md' | 'lg'
export type InputState = 'default' | 'error' | 'success'

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'className'
> {
  size?: InputSize
  state?: InputState
  /** Optional leading element rendered inside the control boundary. */
  startAdornment?: ReactNode
  /** Optional trailing element rendered inside the control boundary. */
  endAdornment?: ReactNode
  className?: string
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'h-8 text-sm',
  md: 'h-9 text-sm',
  lg: 'h-10 text-sm',
}

const stateClasses: Record<InputState, string> = {
  default: 'border-border-input bg-surface-raised focus:border-primary focus:ring-focus-ring/30',
  error: 'border-danger bg-surface-raised focus:border-danger focus:ring-danger/30',
  success: 'border-success bg-surface-raised focus:border-success focus:ring-success/30',
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { size = 'md', state = 'default', startAdornment, endAdornment, disabled, className, ...rest },
  ref,
) {
  return (
    <span className={cn('relative block w-full', className)}>
      {startAdornment && (
        <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-content-subtle">
          {startAdornment}
        </span>
      )}
      <input
        ref={ref}
        disabled={disabled}
        className={cn(
          'block w-full rounded-md border px-3 text-content shadow-xs transition-colors duration-150',
          'placeholder:text-content-subtle',
          'focus:outline-none focus:ring-2',
          'disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-content-muted',
          sizeClasses[size],
          stateClasses[state],
          startAdornment ? 'ps-9' : undefined,
          endAdornment ? 'pe-9' : undefined,
        )}
        {...rest}
      />
      {endAdornment && (
        <span className="absolute inset-y-0 end-0 flex items-center pe-3 text-content-subtle">
          {endAdornment}
        </span>
      )}
    </span>
  )
})

export default Input
