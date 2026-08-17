import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

import Spinner from '@/components/ui/Spinner'
import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Shows an inline spinner and disables the button. */
  loading?: boolean
  startIcon?: ReactNode
  endIcon?: ReactNode
  fullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-content hover:bg-primary-hover active:bg-primary-active',
  secondary:
    'border border-border bg-surface-raised text-content shadow-xs hover:border-border-strong hover:bg-surface-sunken active:bg-surface-sunken',
  outline: 'border border-primary/40 text-primary hover:bg-primary-subtle active:bg-primary-subtle',
  ghost: 'text-content-muted hover:bg-surface-sunken hover:text-content active:bg-surface-sunken',
  danger: 'bg-danger text-danger-content hover:bg-danger-muted active:bg-danger-muted',
}

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'h-7 gap-1.5 px-2.5 text-xs',
  sm: 'h-8 gap-1.5 px-3 text-sm',
  md: 'h-9 gap-2 px-3.5 text-sm',
  lg: 'h-10 gap-2 px-4 text-sm',
  icon: 'h-9 w-9 gap-2 px-0',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    startIcon,
    endIcon,
    fullWidth = false,
    disabled,
    type = 'button',
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex select-none items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        'disabled:pointer-events-none disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? <Spinner size={size === 'xs' ? 12 : 14} aria-hidden="true" /> : startIcon}
      {children}
      {!loading && endIcon}
    </button>
  )
})

export default Button
