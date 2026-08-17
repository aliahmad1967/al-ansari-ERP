import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Dialog from '@/components/ui/Dialog'
import FormField from '@/components/forms/FormField'
import FormActions from '@/components/forms/FormActions'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

export interface StockAdjustmentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: Record<string, unknown>) => void
  warehouses: Array<{ _id: string; name: string }>
}

export function StockAdjustmentForm({
  open,
  onOpenChange,
  onSubmit,
  warehouses,
}: StockAdjustmentFormProps) {
  const { t } = useTranslation('inventory')

  const [code, setCode] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!code.trim()) newErrors.code = 'Required'
    if (!warehouseId) newErrors.warehouseId = 'Required'
    if (!reason.trim()) newErrors.reason = 'Required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSubmit({
      code: code.trim(),
      warehouseId,
      reason: reason.trim(),
      notes: notes.trim() || undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('stockAdjustment.create')}
      size="lg"
      footer={
        <FormActions
          submitLabel={t('stockAdjustment.create')}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label={t('stockAdjustment.code')} required error={errors.code}>
          <Input value={code} onChange={(e) => setCode(e.target.value)} />
        </FormField>
        <FormField label={t('stockAdjustment.warehouse')} required error={errors.warehouseId}>
          <Select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
            <option value="">{t('stockAdjustment.selectWarehouse')}</option>
            {warehouses.map((wh) => (
              <option key={wh._id} value={wh._id}>
                {wh.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label={t('stockAdjustment.reason')} required error={errors.reason} className="sm:col-span-2">
          <Input value={reason} onChange={(e) => setReason(e.target.value)} />
        </FormField>
        <FormField label={t('stockAdjustment.notes')} className="sm:col-span-2">
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </FormField>
      </div>
    </Dialog>
  )
}

export default StockAdjustmentForm
