import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'
import type { Tone } from '@/types/common'

export type BadgeFill = 'soft' | 'solid' | 'outline'

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'className'> {
  variant?: Tone
  fill?: BadgeFill
  size?: 'sm' | 'md'
  /** Shows a small status dot before the content. */
  dot?: boolean
  className?: string
  children: ReactNode
}

const softClasses: Record<Tone, string> = {
  neutral: 'bg-surface-sunken text-content-muted',
  primary: 'bg-primary-subtle text-primary-muted',
  success: 'bg-success-subtle text-success-muted',
  warning: 'bg-warning-subtle text-warning-muted',
  danger: 'bg-danger-subtle text-danger-muted',
  info: 'bg-info-subtle text-info-muted',
}

const solidClasses: Record<Tone, string> = {
  neutral: 'bg-content-muted text-content-inverse',
  primary: 'bg-primary text-primary-content',
  success: 'bg-success text-success-content',
  warning: 'bg-warning text-warning-content',
  danger: 'bg-danger text-danger-content',
  info: 'bg-info text-info-content',
}

const outlineClasses: Record<Tone, string> = {
  neutral: 'border border-border text-content-muted',
  primary: 'border border-primary/50 text-primary-muted',
  success: 'border border-success/50 text-success-muted',
  warning: 'border border-warning/50 text-warning-muted',
  danger: 'border border-danger/50 text-danger-muted',
  info: 'border border-info/50 text-info-muted',
}

const fillClasses: Record<BadgeFill, Record<Tone, string>> = {
  soft: softClasses,
  solid: solidClasses,
  outline: outlineClasses,
}

const sizeClasses: Record<'sm' | 'md', string> = {
  sm: 'h-5 px-2 text-xs',
  md: 'h-6 px-2.5 text-xs',
}

export function Badge({
  variant = 'neutral',
  fill = 'soft',
  size = 'sm',
  dot = false,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium',
        fillClasses[fill][variant],
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      {dot && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

export default Badge
