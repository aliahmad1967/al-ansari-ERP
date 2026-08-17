import Badge, { type BadgeFill } from '@/components/ui/Badge'
import type { Tone } from '@/types/common'

export type StatusTone = Tone

export interface StatusBadgeProps {
  tone: StatusTone
  label: string
  fill?: BadgeFill
  dot?: boolean
}

/**
 * A Badge specialized for status display. Module-agnostic: the consumer maps a
 * domain status to a tone + translated label.
 */
export function StatusBadge({ tone, label, fill = 'soft', dot = true }: StatusBadgeProps) {
  return (
    <Badge variant={tone} fill={fill} dot={dot}>
      {label}
    </Badge>
  )
}

export default StatusBadge
