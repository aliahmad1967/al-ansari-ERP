import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Dialog from '@/components/ui/Dialog'
import FormField from '@/components/forms/FormField'
import FormActions from '@/components/forms/FormActions'
import Input from '@/components/ui/Input'

export interface SupplierInvoiceFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: Record<string, unknown>) => void
}

export function SupplierInvoiceForm({ open, onOpenChange, onSubmit }: SupplierInvoiceFormProps) {
  const { t } = useTranslation('procurement')

  const [code, setCode] = useState('')
  const [invoiceDate, setInvoiceDate] = useState<string>(() => new Date().toISOString().split('T')[0] ?? '')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [purchaseOrderId, setPurchaseOrderId] = useState('')
  const [goodsReceiptId, setGoodsReceiptId] = useState('')
  const [totalAmount, setTotalAmount] = useState(0)
  const [taxAmount, setTaxAmount] = useState(0)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [netAmount, setNetAmount] = useState(0)
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!code.trim()) newErrors.code = 'Required'
    if (!invoiceDate.trim()) newErrors.invoiceDate = 'Required'
    if (!invoiceNumber.trim()) newErrors.invoiceNumber = 'Required'
    if (!supplierId.trim()) newErrors.supplierId = 'Required'
    if (!purchaseOrderId.trim()) newErrors.purchaseOrderId = 'Required'
    if (!netAmount) newErrors.netAmount = 'Required'
    if (!dueDate.trim()) newErrors.dueDate = 'Required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSubmit({
      code: code.trim(),
      invoiceDate: invoiceDate.trim(),
      invoiceNumber: invoiceNumber.trim(),
      supplierId: supplierId.trim(),
      purchaseOrderId: purchaseOrderId.trim(),
      goodsReceiptId: goodsReceiptId.trim() || undefined,
      totalAmount,
      taxAmount,
      discountAmount,
      netAmount,
      dueDate: dueDate.trim(),
      notes: notes.trim() || undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog
      key="new"
      open={open}
      onOpenChange={onOpenChange}
      title={t('supplierInvoice.create')}
      size="lg"
      footer={
        <FormActions
          submitLabel={t('supplierInvoice.create')}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label={t('supplierInvoice.code')} required error={errors.code}>
          <Input value={code} onChange={(e) => setCode(e.target.value)} />
        </FormField>
        <FormField label={t('supplierInvoice.invoiceDate')} required error={errors.invoiceDate}>
          <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
        </FormField>
        <FormField label={t('supplierInvoice.invoiceNumber')} required error={errors.invoiceNumber}>
          <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
        </FormField>
        <FormField label={t('supplierInvoice.supplierId')} required error={errors.supplierId}>
          <Input value={supplierId} onChange={(e) => setSupplierId(e.target.value)} />
        </FormField>
        <FormField label={t('supplierInvoice.purchaseOrderId')} required error={errors.purchaseOrderId}>
          <Input value={purchaseOrderId} onChange={(e) => setPurchaseOrderId(e.target.value)} />
        </FormField>
        <FormField label={t('supplierInvoice.goodsReceiptId')}>
          <Input value={goodsReceiptId} onChange={(e) => setGoodsReceiptId(e.target.value)} />
        </FormField>
        <FormField label={t('supplierInvoice.totalAmount')} required>
          <Input type="number" min={0} value={totalAmount} onChange={(e) => setTotalAmount(Number(e.target.value))} />
        </FormField>
        <FormField label={t('supplierInvoice.taxAmount')}>
          <Input type="number" min={0} value={taxAmount} onChange={(e) => setTaxAmount(Number(e.target.value))} />
        </FormField>
        <FormField label={t('supplierInvoice.discountAmount')}>
          <Input type="number" min={0} value={discountAmount} onChange={(e) => setDiscountAmount(Number(e.target.value))} />
        </FormField>
        <FormField label={t('supplierInvoice.netAmount')} required error={errors.netAmount}>
          <Input type="number" min={0} value={netAmount} onChange={(e) => setNetAmount(Number(e.target.value))} />
        </FormField>
        <FormField label={t('supplierInvoice.dueDate')} required error={errors.dueDate}>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </FormField>
        <FormField label={t('supplierInvoice.notes')} className="sm:col-span-2">
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </FormField>
      </div>
    </Dialog>
  )
}

export default SupplierInvoiceForm
