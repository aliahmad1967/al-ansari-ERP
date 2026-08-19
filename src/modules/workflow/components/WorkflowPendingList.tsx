/**
 * WorkflowPendingList — list of pending approvals for the current user.
 *
 * Reusable component that can be placed on dashboards or sidebars
 * to show pending workflow approvals.
 */

import { useTranslation } from 'react-i18next'

import { EmptyState } from '@/components/ui/EmptyState'
import type { WorkflowPendingApproval } from '@/types/workflow'

interface WorkflowPendingListProps {
  approvals: WorkflowPendingApproval[]
  onApprove?: (instanceId: string) => void
  onReject?: (instanceId: string) => void
  className?: string
  maxItems?: number
}

export function WorkflowPendingList({
  approvals,
  onApprove,
  onReject,
  className,
  maxItems = 10,
}: WorkflowPendingListProps) {
  const { t, i18n } = useTranslation('workflow')
  const isRtl = i18n.language === 'ar'

  if (approvals.length === 0) {
    return (
      <EmptyState
        title={t('instances.noPending')}
        description={t('instances.noPending')}
        className={className}
      />
    )
  }

  const displayApprovals = approvals.slice(0, maxItems)

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-4">{t('instances.pending')}</h3>
      <div className="space-y-3">
        {displayApprovals.map((approval) => {
          const definitionName =
            isRtl && approval.definitionNameAr
              ? approval.definitionNameAr
              : approval.definitionName
          const stepName =
            isRtl && approval.currentStepNameAr
              ? approval.currentStepNameAr
              : approval.currentStepName

          return (
            <div
              key={approval.instanceId}
              className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{definitionName}</p>
                  <p className="text-sm text-muted-foreground">
                    {approval.entityType} - {stepName}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {approval.createdAt.toLocaleDateString()}
                </div>
              </div>
              {(onApprove || onReject) && (
                <div className="flex gap-2 mt-2">
                  {onApprove && (
                    <button
                      onClick={() => onApprove(approval.instanceId)}
                      className="text-sm text-success hover:underline"
                    >
                      {t('actions.approve')}
                    </button>
                  )}
                  {onReject && (
                    <button
                      onClick={() => onReject(approval.instanceId)}
                      className="text-sm text-danger hover:underline"
                    >
                      {t('actions.reject')}
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
