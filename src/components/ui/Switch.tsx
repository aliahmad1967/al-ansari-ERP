import { forwardRef, useId, type ButtonHTMLAttributes, type ReactNode } from 'react'

import { cn } from '@/lib/cn'

export type SwitchSize = 'sm' | 'md'

export interface SwitchProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange' | 'className'
> {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label?: ReactNode
  size?: SwitchSize
  className?: string
}

const trackClasses: Record<SwitchSize, string> = {
  sm: 'h-5 w-9',
  md: 'h-6 w-11',
}

const thumbClasses: Record<SwitchSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { checked, onCheckedChange, label, size = 'md', disabled, className, ...rest },
  ref,
) {
  const generatedId = useId()

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <button
        ref={ref}
        id={rest.id ?? generatedId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          'inline-flex shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
          'disabled:cursor-not-allowed disabled:opacity-60',
          trackClasses[size],
          checked ? 'bg-primary' : 'bg-border-strong',
        )}
        {...rest}
      >
        <span
          aria-hidden="true"
          className={cn(
            'rounded-full bg-thumb shadow-sm transition-all duration-200',
            thumbClasses[size],
            checked ? 'ms-auto' : 'me-auto',
          )}
        />
      </button>
      {label && <span className="text-sm text-content">{label}</span>}
    </span>
  )
})

export default Switch
