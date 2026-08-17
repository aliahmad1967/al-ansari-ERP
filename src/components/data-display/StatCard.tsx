import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

import Skeleton from '@/components/ui/Skeleton'
import { cn } from '@/lib/cn'
import type { Tone } from '@/types/common'

export interface StatCardProps {
  label: ReactNode
  value: ReactNode
  icon?: ReactNode
  tone?: Tone
  /** Percentage change vs previous period. Positive = up, negative = down. */
  trend?: number | null
  trendLabel?: ReactNode
  description?: ReactNode
  loading?: boolean
  className?: string
}

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-surface-sunken text-content-muted',
  primary: 'bg-primary-subtle text-primary',
  success: 'bg-success-subtle text-success-muted',
  warning: 'bg-warning-subtle text-warning-muted',
  danger: 'bg-danger-subtle text-danger-muted',
  info: 'bg-info-subtle text-info-muted',
}

export function StatCard({
  label,
  value,
  icon,
  tone = 'primary',
  trend,
  trendLabel,
  description,
  loading = false,
  className,
}: StatCardProps) {
  const isUp = (trend ?? 0) >= 0

  return (
    <div
      className={cn('rounded-lg border border-border bg-surface-raised p-5 shadow-sm', className)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-content-muted">{label}</p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-28" />
          ) : (
            <p className="mt-1.5 truncate text-2xl font-semibold tracking-tight text-content">
              {value}
            </p>
          )}
        </div>

        {icon && (
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg',
              toneClasses[tone],
            )}
          >
            {icon}
          </div>
        )}
      </div>

      {trend !== undefined && trend !== null && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span
            className={cn(
              'inline-flex items-center gap-0.5 font-medium',
              isUp ? 'text-success-muted' : 'text-danger-muted',
            )}
          >
            {isUp ? (
              <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
            ) : (
              <ArrowDownRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
            )}
            {Math.abs(trend)}%
          </span>
          {trendLabel && <span className="text-content-subtle">{trendLabel}</span>}
        </div>
      )}

      {description && <p className="mt-1 text-xs text-content-subtle">{description}</p>}
    </div>
  )
}

export default StatCard
