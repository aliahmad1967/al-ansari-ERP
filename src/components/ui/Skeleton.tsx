import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

export interface SkeletonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  /** Adds the shimmer overlay effect on top of the pulse. */
  shimmer?: boolean
  className?: string
}

export function Skeleton({ shimmer = false, className, ...rest }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded-md bg-surface-sunken',
        shimmer && 'ds-shimmer',
        className,
      )}
      {...rest}
    />
  )
}

export interface SkeletonTextProps {
  /** Number of lines to render. */
  lines?: number
  className?: string
}

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className={cn('h-3.5', index === lines - 1 && 'w-3/4')} />
      ))}
    </div>
  )
}

export function SkeletonCircle({ className, ...rest }: SkeletonProps) {
  return <Skeleton className={cn('rounded-full', className)} {...rest} />
}

export function SkeletonButton({ className, ...rest }: SkeletonProps) {
  return <Skeleton className={cn('h-9 w-24 rounded-md', className)} {...rest} />
}

export function SkeletonCard({ className, ...rest }: SkeletonProps) {
  return (
    <Skeleton
      className={cn('rounded-lg border border-border p-5 shadow-sm', className)}
      {...rest}
    />
  )
}

export default Skeleton
