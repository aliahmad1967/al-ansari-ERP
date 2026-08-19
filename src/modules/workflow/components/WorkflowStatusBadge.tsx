/**
 * WorkflowStatusBadge — displays workflow status with appropriate color.
 *
 * Reusable component that can be used across any module that uses workflows.
 */

import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/Badge'
import type { Tone } from '@/types/common'

interface WorkflowStatusBadgeProps {
  status: string
  className?: string
}

const STATUS_TONE_MAP: Record<string, Tone> = {
  draft: 'neutral',
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  cancelled: 'neutral',
  completed: 'success',
  archived: 'info',
}

const STATUS_KEY_MAP: Record<string, string> = {
  draft: 'workflow.status.draft',
  pending: 'workflow.status.pending',
  approved: 'workflow.status.approved',
  rejected: 'workflow.status.rejected',
  cancelled: 'workflow.status.cancelled',
  completed: 'workflow.status.completed',
  archived: 'workflow.status.archived',
}

export function WorkflowStatusBadge({ status, className }: WorkflowStatusBadgeProps) {
  const { t } = useTranslation('workflow')
  const tone = STATUS_TONE_MAP[status] ?? 'neutral'
  const labelKey = STATUS_KEY_MAP[status] ?? `workflow.status.${status}`

  return (
    <Badge tone={tone} className={className}>
      {t(labelKey)}
    </Badge>
  )
}
