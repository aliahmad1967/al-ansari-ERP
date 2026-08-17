import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Dialog from '@/components/ui/Dialog'
import FormField from '@/components/forms/FormField'
import FormActions from '@/components/forms/FormActions'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

export interface InventoryCountFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  count?: {
    _id: string
    code: string
    warehouseId: string
    countDate: string
    notes: string | null
  } | null
  onSubmit: (input: Record<string, unknown>) => void
  warehouses: Array<{ _id: string; name: string }>
}

export function InventoryCountForm({
  open,
  onOpenChange,
  count,
  onSubmit,
  warehouses,
}: InventoryCountFormProps) {
  const { t } = useTranslation('inventory')
  const isEdit = !!count

  const [code, setCode] = useState(() => count?.code ?? '')
  const [warehouseId, setWarehouseId] = useState(() => count?.warehouseId ?? '')
  const [countDate, setCountDate] = useState(() => count?.countDate ?? '')
  const [notes, setNotes] = useState(() => count?.notes ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!code.trim()) newErrors.code = 'Required'
    if (!warehouseId) newErrors.warehouseId = 'Required'
    if (!countDate) newErrors.countDate = 'Required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSubmit({
      code: code.trim(),
      warehouseId,
      countDate,
      notes: notes.trim() || undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog
      key={count?._id ?? 'new'}
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? t('inventoryCount.edit') : t('inventoryCount.create')}
      size="lg"
      footer={
        <FormActions
          submitLabel={isEdit ? t('inventoryCount.edit') : t('inventoryCount.create')}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label={t('inventoryCount.code')} required error={errors.code}>
          <Input value={code} onChange={(e) => setCode(e.target.value)} />
        </FormField>
        <FormField label={t('inventoryCount.warehouse')} required error={errors.warehouseId}>
          <Select
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            disabled={isEdit}
          >
            <option value="">{t('inventoryCount.selectWarehouse')}</option>
            {warehouses.map((wh) => (
              <option key={wh._id} value={wh._id}>
                {wh.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label={t('inventoryCount.countDate')} required error={errors.countDate}>
          <Input
            type="date"
            value={countDate}
            onChange={(e) => setCountDate(e.target.value)}
          />
        </FormField>
        <FormField label={t('inventoryCount.notes')}>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </FormField>
      </div>
    </Dialog>
  )
}

export default InventoryCountForm
