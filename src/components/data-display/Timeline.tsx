import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'
import type { Tone } from '@/types/common'

export interface TimelineProps extends Omit<HTMLAttributes<HTMLOListElement>, 'className'> {
  className?: string
  children: ReactNode
}

export interface TimelineItemProps {
  title: ReactNode
  description?: ReactNode
  time?: ReactNode
  icon?: ReactNode
  tone?: Tone
  /** Hides the connecting line after this item (e.g. for the last item). */
  isLast?: boolean
  className?: string
}

const nodeToneClasses: Record<Tone, string> = {
  neutral: 'bg-surface-sunken text-content-muted border-border',
  primary: 'bg-primary-subtle text-primary border-primary/30',
  success: 'bg-success-subtle text-success-muted border-success/30',
  warning: 'bg-warning-subtle text-warning-muted border-warning/30',
  danger: 'bg-danger-subtle text-danger-muted border-danger/30',
  info: 'bg-info-subtle text-info-muted border-info/30',
}

export function Timeline({ className, children, ...rest }: TimelineProps) {
  return (
    <ol className={cn('space-y-0', className)} {...rest}>
      {children}
    </ol>
  )
}

export function TimelineItem({
  title,
  description,
  time,
  icon,
  tone = 'neutral',
  isLast = false,
  className,
}: TimelineItemProps) {
  return (
    <li className={cn('relative flex gap-3 pb-5 last:pb-0', className)}>
      <div className="flex flex-col items-center">
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border',
            nodeToneClasses[tone],
          )}
        >
          {icon}
        </span>
        {!isLast && <span aria-hidden="true" className="mt-1 w-px flex-1 bg-border" />}
      </div>

      <div className="min-w-0 flex-1 pb-1">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-semibold text-content">{title}</p>
          {time && <span className="text-xs text-content-subtle">{time}</span>}
        </div>
        {description && <p className="mt-0.5 text-sm text-content-muted">{description}</p>}
      </div>
    </li>
  )
}

export default Timeline
