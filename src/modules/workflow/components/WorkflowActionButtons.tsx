/**
 * WorkflowActionButtons — approval action buttons for workflow instances.
 *
 * Renders approve/reject/cancel buttons based on the current user's
 * permissions and the workflow's current state.
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { usePermissions } from '@/hooks/usePermissions'

interface WorkflowActionButtonsProps {
  instanceId: string
  status: string
  onApprove: (instanceId: string, comment?: string) => void
  onReject: (instanceId: string, comment?: string) => void
  onCancel: (instanceId: string) => void
  disabled?: boolean
}

export function WorkflowActionButtons({
  instanceId,
  status,
  onApprove,
  onReject,
  onCancel,
  disabled = false,
}: WorkflowActionButtonsProps) {
  const { t } = useTranslation('workflow')
  const { canDo } = usePermissions()
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectComment, setRejectComment] = useState('')
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [approveComment, setApproveComment] = useState('')

  const canApprove = canDo('workflow', 'instance', 'approve') && status === 'pending'
  const canReject = canDo('workflow', 'instance', 'approve') && status === 'pending'
  const canCancel = canDo('workflow', 'instance', 'update') && status === 'pending'

  if (!canApprove && !canReject && !canCancel) {
    return null
  }

  const handleApprove = () => {
    onApprove(instanceId, approveComment || undefined)
    setShowApproveDialog(false)
    setApproveComment('')
  }

  const handleReject = () => {
    onReject(instanceId, rejectComment || undefined)
    setShowRejectDialog(false)
    setRejectComment('')
  }

  return (
    <>
      <div className="flex gap-2">
        {canApprove && (
          <Button
            tone="success"
            onClick={() => setShowApproveDialog(true)}
            disabled={disabled}
          >
            {t('actions.approve')}
          </Button>
        )}
        {canReject && (
          <Button
            tone="danger"
            onClick={() => setShowRejectDialog(true)}
            disabled={disabled}
          >
            {t('actions.reject')}
          </Button>
        )}
        {canCancel && (
          <Button
            tone="neutral"
            onClick={() => onCancel(instanceId)}
            disabled={disabled}
          >
            {t('actions.cancel')}
          </Button>
        )}
      </div>

      <Dialog
        open={showApproveDialog}
        onOpenChange={setShowApproveDialog}
        title={t('actions.approve')}
      >
        <div className="space-y-4">
          <p>{t('actions.confirmApprove')}</p>
          <Input
            label={t('history.comment')}
            value={approveComment}
            onChange={(e) => setApproveComment(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button
              tone="neutral"
              onClick={() => setShowApproveDialog(false)}
            >
              {t('actions.cancel')}
            </Button>
            <Button tone="success" onClick={handleApprove}>
              {t('actions.approve')}
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        title={t('actions.reject')}
      >
        <div className="space-y-4">
          <p>{t('actions.confirmReject')}</p>
          <Input
            label={t('history.comment')}
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button
              tone="neutral"
              onClick={() => setShowRejectDialog(false)}
            >
              {t('actions.cancel')}
            </Button>
            <Button tone="danger" onClick={handleReject}>
              {t('actions.reject')}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  )
}
