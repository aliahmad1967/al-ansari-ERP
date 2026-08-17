import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'
import type { Tone } from '@/types/common'

export interface ActivityFeedProps extends Omit<HTMLAttributes<HTMLUListElement>, 'className'> {
  className?: string
  children: ReactNode
}

export interface ActivityItemProps {
  title: ReactNode
  description?: ReactNode
  timestamp?: ReactNode
  icon?: ReactNode
  tone?: Tone
  /** Optional action element rendered on the inline-end side. */
  action?: ReactNode
  className?: string
}

const iconToneClasses: Record<Tone, string> = {
  neutral: 'bg-surface-sunken text-content-muted',
  primary: 'bg-primary-subtle text-primary',
  success: 'bg-success-subtle text-success-muted',
  warning: 'bg-warning-subtle text-warning-muted',
  danger: 'bg-danger-subtle text-danger-muted',
  info: 'bg-info-subtle text-info-muted',
}

export function ActivityFeed({ className, children, ...rest }: ActivityFeedProps) {
  return (
    <ul className={cn('space-y-1', className)} {...rest}>
      {children}
    </ul>
  )
}

export function ActivityItem({
  title,
  description,
  timestamp,
  icon,
  tone = 'neutral',
  action,
  className,
}: ActivityItemProps) {
  return (
    <li
      className={cn(
        'flex items-start gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-surface-sunken/50',
        className,
      )}
    >
      {icon && (
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
            iconToneClasses[tone],
          )}
        >
          {icon}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-content">{title}</p>
        {description && <p className="mt-0.5 text-sm text-content-muted">{description}</p>}
        {timestamp && <p className="mt-0.5 text-xs text-content-subtle">{timestamp}</p>}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </li>
  )
}

export default ActivityFeed
