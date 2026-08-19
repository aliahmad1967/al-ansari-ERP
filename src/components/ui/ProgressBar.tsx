import { cn } from '@/lib/cn'

export interface ProgressBarProps {
  value: number
  max?: number
  size?: 'sm' | 'md'
  showLabel?: boolean
  className?: string
  color?: 'primary' | 'success' | 'warning' | 'danger'
}

const colorClasses: Record<string, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
}

export default function ProgressBar({
  value,
  max = 100,
  size = 'sm',
  showLabel = false,
  color = 'primary',
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  const sizeClass = size === 'sm' ? 'h-2' : 'h-3'

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'w-full overflow-hidden rounded-full bg-border',
          sizeClass,
        )}
      >
        <div
          className={cn(
            'rounded-full transition-all duration-300',
            colorClasses[color],
            sizeClass,
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm text-content-muted tabular-nums">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  )
}
