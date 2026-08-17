import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Dialog from '@/components/ui/Dialog'
import FormField from '@/components/forms/FormField'
import FormActions from '@/components/forms/FormActions'
import Input from '@/components/ui/Input'

export interface PurchaseRequestFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: Record<string, unknown>) => void
}

export function PurchaseRequestForm({ open, onOpenChange, onSubmit }: PurchaseRequestFormProps) {
  const { t } = useTranslation('procurement')

  const [code, setCode] = useState('')
  const [requestDate, setRequestDate] = useState<string>(() => new Date().toISOString().split('T')[0] ?? '')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!code.trim()) newErrors.code = 'Required'
    if (!requestDate.trim()) newErrors.requestDate = 'Required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSubmit({
      code: code.trim(),
      requestDate: requestDate.trim(),
      notes: notes.trim() || undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog
      key="new"
      open={open}
      onOpenChange={onOpenChange}
      title={t('purchaseRequest.create')}
      size="lg"
      footer={
        <FormActions
          submitLabel={t('purchaseRequest.create')}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label={t('purchaseRequest.code')} required error={errors.code}>
          <Input value={code} onChange={(e) => setCode(e.target.value)} />
        </FormField>
        <FormField label={t('purchaseRequest.requestDate')} required error={errors.requestDate}>
          <Input type="date" value={requestDate} onChange={(e) => setRequestDate(e.target.value)} />
        </FormField>
        <FormField label={t('purchaseRequest.notes')} className="sm:col-span-2">
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </FormField>
      </div>
    </Dialog>
  )
}

export default PurchaseRequestForm
