import { forwardRef, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/cn'
import type { InputState } from '@/components/ui/Input'

export type SelectSize = 'sm' | 'md' | 'lg'

export interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'size' | 'className'
> {
  size?: SelectSize
  state?: InputState
  className?: string
}

const sizeClasses: Record<SelectSize, string> = {
  sm: 'h-8 text-sm',
  md: 'h-9 text-sm',
  lg: 'h-10 text-sm',
}

const stateClasses: Record<InputState, string> = {
  default: 'border-border-input bg-surface-raised focus:border-primary focus:ring-focus-ring/30',
  error: 'border-danger bg-surface-raised focus:border-danger focus:ring-danger/30',
  success: 'border-success bg-surface-raised focus:border-success focus:ring-success/30',
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { size = 'md', state = 'default', disabled, className, children, ...rest },
  ref,
) {
  return (
    <span className={cn('relative block w-full', className)}>
      <select
        ref={ref}
        disabled={disabled}
        className={cn(
          'block w-full cursor-pointer appearance-none rounded-md border px-3 pe-9 text-content shadow-xs transition-colors duration-150',
          'focus:outline-none focus:ring-2',
          'disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-content-muted',
          sizeClasses[size],
          stateClasses[state],
        )}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle"
      />
    </span>
  )
})

export default Select
