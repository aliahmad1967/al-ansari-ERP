/**
 * WorkflowInitiateButton — button to initiate a workflow for an entity.
 *
 * Reusable component that can be placed on any entity's detail page
 * to start a workflow process.
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { usePermissions } from '@/hooks/usePermissions'

interface WorkflowInitiateButtonProps {
  entityType: string
  entityId: string
  onInitiate: (entityType: string, entityId: string) => void
  disabled?: boolean
  hasActiveWorkflow?: boolean
}

export function WorkflowInitiateButton({
  entityType,
  entityId,
  onInitiate,
  disabled = false,
  hasActiveWorkflow = false,
}: WorkflowInitiateButtonProps) {
  const { t } = useTranslation('workflow')
  const { canDo } = usePermissions()
  const [showConfirm, setShowConfirm] = useState(false)

  const canInitiate = canDo('workflow', 'instance', 'create')

  if (!canInitiate || hasActiveWorkflow) {
    return null
  }

  const handleInitiate = () => {
    onInitiate(entityType, entityId)
    setShowConfirm(false)
  }

  return (
    <>
      <Button
        tone="primary"
        onClick={() => setShowConfirm(true)}
        disabled={disabled}
      >
        {t('instances.initiate')}
      </Button>

      <Dialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title={t('instances.initiate')}
      >
        <div className="space-y-4">
          <p>{t('actions.confirmSubmit')}</p>
          <div className="flex justify-end gap-2">
            <Button
              tone="neutral"
              onClick={() => setShowConfirm(false)}
            >
              {t('actions.cancel')}
            </Button>
            <Button tone="primary" onClick={handleInitiate}>
              {t('actions.submit')}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  )
}
