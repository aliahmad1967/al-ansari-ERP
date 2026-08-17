import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Dialog from '@/components/ui/Dialog'
import FormField from '@/components/forms/FormField'
import FormActions from '@/components/forms/FormActions'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

export interface PurchaseOrderFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  suppliers: Array<{ _id: string; name: string }>
  onSubmit: (input: Record<string, unknown>) => void
}

export function PurchaseOrderForm({ open, onOpenChange, suppliers, onSubmit }: PurchaseOrderFormProps) {
  const { t } = useTranslation('procurement')

  const [code, setCode] = useState('')
  const [orderDate, setOrderDate] = useState<string>(() => new Date().toISOString().split('T')[0] ?? '')
  const [supplierId, setSupplierId] = useState('')
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!code.trim()) newErrors.code = 'Required'
    if (!orderDate.trim()) newErrors.orderDate = 'Required'
    if (!supplierId.trim()) newErrors.supplierId = 'Required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSubmit({
      code: code.trim(),
      orderDate: orderDate.trim(),
      supplierId: supplierId.trim(),
      expectedDeliveryDate: expectedDeliveryDate.trim() || undefined,
      notes: notes.trim() || undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog
      key="new"
      open={open}
      onOpenChange={onOpenChange}
      title={t('purchaseOrder.create')}
      size="lg"
      footer={
        <FormActions
          submitLabel={t('purchaseOrder.create')}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label={t('purchaseOrder.code')} required error={errors.code}>
          <Input value={code} onChange={(e) => setCode(e.target.value)} />
        </FormField>
        <FormField label={t('purchaseOrder.orderDate')} required error={errors.orderDate}>
          <Input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
        </FormField>
        <FormField label={t('purchaseOrder.supplierId')} required error={errors.supplierId}>
          <Select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
            <option value="">{t('purchaseOrder.selectSupplier')}</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </Select>
        </FormField>
        <FormField label={t('purchaseOrder.expectedDeliveryDate')}>
          <Input type="date" value={expectedDeliveryDate} onChange={(e) => setExpectedDeliveryDate(e.target.value)} />
        </FormField>
        <FormField label={t('purchaseOrder.notes')} className="sm:col-span-2">
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </FormField>
      </div>
    </Dialog>
  )
}

export default PurchaseOrderForm
