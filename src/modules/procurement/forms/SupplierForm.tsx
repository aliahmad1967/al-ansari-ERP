import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Dialog from '@/components/ui/Dialog'
import FormField from '@/components/forms/FormField'
import FormActions from '@/components/forms/FormActions'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

export interface SupplierFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier?: {
    _id: string
    code: string
    name: string
    nameAr: string | null
    contactPerson: string | null
    contactPersonAr: string | null
    email: string | null
    phone: string | null
    phone2: string | null
    address: string | null
    addressAr: string | null
    taxNumber: string | null
    paymentTerms: string | null
    currency: string
    rating: number
    notes: string | null
    status: string
    isActive: boolean
  } | null
  onSubmit: (input: Record<string, unknown>) => void
}

export function SupplierForm({ open, onOpenChange, supplier, onSubmit }: SupplierFormProps) {
  const { t } = useTranslation('procurement')
  const isEdit = !!supplier

  const [code, setCode] = useState(() => supplier?.code ?? '')
  const [name, setName] = useState(() => supplier?.name ?? '')
  const [nameAr, setNameAr] = useState(() => supplier?.nameAr ?? '')
  const [contactPerson, setContactPerson] = useState(() => supplier?.contactPerson ?? '')
  const [contactPersonAr, setContactPersonAr] = useState(() => supplier?.contactPersonAr ?? '')
  const [email, setEmail] = useState(() => supplier?.email ?? '')
  const [phone, setPhone] = useState(() => supplier?.phone ?? '')
  const [phone2, setPhone2] = useState(() => supplier?.phone2 ?? '')
  const [address, setAddress] = useState(() => supplier?.address ?? '')
  const [addressAr, setAddressAr] = useState(() => supplier?.addressAr ?? '')
  const [taxNumber, setTaxNumber] = useState(() => supplier?.taxNumber ?? '')
  const [paymentTerms, setPaymentTerms] = useState(() => supplier?.paymentTerms ?? '')
  const [currency, setCurrency] = useState(() => supplier?.currency ?? 'SAR')
  const [rating, setRating] = useState(() => supplier?.rating ?? 0)
  const [status, setStatus] = useState(() => supplier?.status ?? 'active')
  const [notes, setNotes] = useState(() => supplier?.notes ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!code.trim()) newErrors.code = 'Required'
    if (!name.trim()) newErrors.name = 'Required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSubmit({
      code: code.trim(),
      name: name.trim(),
      nameAr: nameAr.trim() || undefined,
      contactPerson: contactPerson.trim() || undefined,
      contactPersonAr: contactPersonAr.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      phone2: phone2.trim() || undefined,
      address: address.trim() || undefined,
      addressAr: addressAr.trim() || undefined,
      taxNumber: taxNumber.trim() || undefined,
      paymentTerms: paymentTerms.trim() || undefined,
      currency,
      rating,
      status,
      notes: notes.trim() || undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog
      key={supplier?._id ?? 'new'}
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? t('supplier.edit') : t('supplier.create')}
      size="lg"
      footer={
        <FormActions
          submitLabel={isEdit ? t('supplier.edit') : t('supplier.create')}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label={t('supplier.code')} required error={errors.code}>
          <Input value={code} onChange={(e) => setCode(e.target.value)} disabled={isEdit} />
        </FormField>
        <FormField label={t('supplier.name')} required error={errors.name}>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField label={t('supplier.nameAr')}>
          <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} dir="rtl" />
        </FormField>
        <FormField label={t('supplier.contactPerson')}>
          <Input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
        </FormField>
        <FormField label={t('supplier.contactPersonAr')}>
          <Input value={contactPersonAr} onChange={(e) => setContactPersonAr(e.target.value)} dir="rtl" />
        </FormField>
        <FormField label={t('supplier.email')}>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
        </FormField>
        <FormField label={t('supplier.phone')}>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </FormField>
        <FormField label={t('supplier.phone2')}>
          <Input value={phone2} onChange={(e) => setPhone2(e.target.value)} />
        </FormField>
        <FormField label={t('supplier.address')} className="sm:col-span-2">
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </FormField>
        <FormField label={t('supplier.addressAr')} className="sm:col-span-2">
          <Input value={addressAr} onChange={(e) => setAddressAr(e.target.value)} dir="rtl" />
        </FormField>
        <FormField label={t('supplier.taxNumber')}>
          <Input value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} />
        </FormField>
        <FormField label={t('supplier.paymentTerms')}>
          <Input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
        </FormField>
        <FormField label={t('supplier.currency')}>
          <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="SAR">SAR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </Select>
        </FormField>
        <FormField label={t('supplier.rating')}>
          <Input type="number" min={0} max={5} value={rating} onChange={(e) => setRating(Number(e.target.value))} />
        </FormField>
        <FormField label={t('supplier.status')}>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">{t('supplier.active')}</option>
            <option value="inactive">{t('supplier.inactive')}</option>
            <option value="blacklisted">{t('supplier.blacklisted')}</option>
          </Select>
        </FormField>
        <FormField label={t('supplier.notes')} className="sm:col-span-2">
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </FormField>
      </div>
    </Dialog>
  )
}

export default SupplierForm
