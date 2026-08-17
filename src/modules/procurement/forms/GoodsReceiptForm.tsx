import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Dialog from '@/components/ui/Dialog'
import FormField from '@/components/forms/FormField'
import FormActions from '@/components/forms/FormActions'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

export interface GoodsReceiptFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  warehouses: Array<{ _id: string; name: string }>
  onSubmit: (input: Record<string, unknown>) => void
}

export function GoodsReceiptForm({ open, onOpenChange, warehouses, onSubmit }: GoodsReceiptFormProps) {
  const { t } = useTranslation('procurement')

  const [code, setCode] = useState('')
  const [receiptDate, setReceiptDate] = useState<string>(() => new Date().toISOString().split('T')[0] ?? '')
  const [purchaseOrderId, setPurchaseOrderId] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [deliveryNoteNumber, setDeliveryNoteNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!code.trim()) newErrors.code = 'Required'
    if (!receiptDate.trim()) newErrors.receiptDate = 'Required'
    if (!purchaseOrderId.trim()) newErrors.purchaseOrderId = 'Required'
    if (!supplierId.trim()) newErrors.supplierId = 'Required'
    if (!warehouseId.trim()) newErrors.warehouseId = 'Required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSubmit({
      code: code.trim(),
      receiptDate: receiptDate.trim(),
      purchaseOrderId: purchaseOrderId.trim(),
      supplierId: supplierId.trim(),
      warehouseId: warehouseId.trim(),
      deliveryNoteNumber: deliveryNoteNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog
      key="new"
      open={open}
      onOpenChange={onOpenChange}
      title={t('goodsReceipt.create')}
      size="lg"
      footer={
        <FormActions
          submitLabel={t('goodsReceipt.create')}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label={t('goodsReceipt.code')} required error={errors.code}>
          <Input value={code} onChange={(e) => setCode(e.target.value)} />
        </FormField>
        <FormField label={t('goodsReceipt.receiptDate')} required error={errors.receiptDate}>
          <Input type="date" value={receiptDate} onChange={(e) => setReceiptDate(e.target.value)} />
        </FormField>
        <FormField label={t('goodsReceipt.purchaseOrderId')} required error={errors.purchaseOrderId}>
          <Input value={purchaseOrderId} onChange={(e) => setPurchaseOrderId(e.target.value)} />
        </FormField>
        <FormField label={t('goodsReceipt.supplierId')} required error={errors.supplierId}>
          <Input value={supplierId} onChange={(e) => setSupplierId(e.target.value)} />
        </FormField>
        <FormField label={t('goodsReceipt.warehouseId')} required error={errors.warehouseId}>
          <Select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
            <option value="">{t('goodsReceipt.selectWarehouse')}</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>{w.name}</option>
            ))}
          </Select>
        </FormField>
        <FormField label={t('goodsReceipt.deliveryNoteNumber')}>
          <Input value={deliveryNoteNumber} onChange={(e) => setDeliveryNoteNumber(e.target.value)} />
        </FormField>
        <FormField label={t('goodsReceipt.notes')} className="sm:col-span-2">
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </FormField>
      </div>
    </Dialog>
  )
}

export default GoodsReceiptForm
