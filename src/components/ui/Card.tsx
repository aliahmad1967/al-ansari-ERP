import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'

export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  padding?: CardPadding
  /** Enables hover + focus interaction affordances. */
  interactive?: boolean
  bordered?: boolean
  className?: string
  children: ReactNode
}

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

export function Card({
  padding = 'none',
  interactive = false,
  bordered = true,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-surface-raised shadow-sm',
        bordered && 'border border-border',
        interactive &&
          'transition-shadow duration-150 hover:border-border-strong hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/40',
        paddingClasses[padding],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export interface CardSectionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  className?: string
  children: ReactNode
}

export function CardHeader({ className, children, ...rest }: CardSectionProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 px-5 pt-5', className)} {...rest}>
      {children}
    </div>
  )
}

export function CardTitle({
  className,
  children,
  ...rest
}: Omit<CardSectionProps, 'children'> & { children: ReactNode }) {
  return (
    <h3 className={cn('text-base font-semibold text-content', className)} {...rest}>
      {children}
    </h3>
  )
}

export function CardDescription({
  className,
  children,
  ...rest
}: Omit<CardSectionProps, 'children'> & { children: ReactNode }) {
  return (
    <p className={cn('mt-0.5 text-sm text-content-muted', className)} {...rest}>
      {children}
    </p>
  )
}

export function CardContent({ className, children, ...rest }: CardSectionProps) {
  return (
    <div className={cn('px-5 py-5', className)} {...rest}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...rest }: CardSectionProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 border-t border-border px-5 py-4',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export default Card
