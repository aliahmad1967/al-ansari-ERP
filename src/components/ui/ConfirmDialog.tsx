import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'

import Dialog from '@/components/ui/Dialog'
import FormActions from '@/components/forms/FormActions'

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  message: string | ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
  onConfirm: () => void | Promise<void>
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = 'danger',
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const { t } = useTranslation('ui')

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      footer={
        <FormActions
          submitLabel={confirmLabel ?? t('confirm')}
          cancelLabel={cancelLabel ?? t('cancel')}
          variant={variant}
          loading={loading}
          onCancel={() => onOpenChange(false)}
          onSubmit={onConfirm}
        />
      }
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 flex-shrink-0 text-warning mt-0.5" aria-hidden="true" />
        <p className="text-sm text-content-muted">{message}</p>
      </div>
    </Dialog>
  )
}
