import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Dialog from '@/components/ui/Dialog'
import FormField from '@/components/forms/FormField'
import FormActions from '@/components/forms/FormActions'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import type { Organization, OrganizationInput, OrganizationStatusValue } from '@/core/models/Organization'
import { OrganizationStatus } from '@/core/models/Organization'

export interface OrganizationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organization?: Organization | null
  onSubmit: (input: OrganizationInput) => void
}

export function OrganizationForm({ open, onOpenChange, organization, onSubmit }: OrganizationFormProps) {
  const { t } = useTranslation('organization')
  const isEdit = !!organization

  const [code, setCode] = useState(() => organization?.code ?? '')
  const [name, setName] = useState(() => organization?.name ?? '')
  const [nameAr, setNameAr] = useState(() => organization?.nameAr ?? '')
  const [email, setEmail] = useState(() => organization?.email ?? '')
  const [phone, setPhone] = useState(() => organization?.phone ?? '')
  const [currency, setCurrency] = useState(() => organization?.currency ?? 'SAR')
  const [status, setStatus] = useState<OrganizationStatusValue>(() => organization?.status ?? OrganizationStatus.Active)
  const [notes, setNotes] = useState(() => organization?.notes ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!code.trim()) newErrors.code = t('organization.code', { defaultValue: 'Code is required' })
    if (!name.trim()) newErrors.name = t('organization.name', { defaultValue: 'Name is required' })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSubmit({
      code: code.trim(),
      name: name.trim(),
      nameAr: nameAr.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      currency,
      status,
      notes: notes.trim() || undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog
      key={organization?._id ?? 'new'}
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? t('organization.edit') : t('organization.create')}
      size="lg"
      footer={
        <FormActions
          submitLabel={isEdit ? t('organization.edit') : t('organization.create')}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label={t('organization.code')} required error={errors.code}>
          <Input value={code} onChange={(e) => setCode(e.target.value)} disabled={isEdit} />
        </FormField>
        <FormField label={t('organization.name')} required error={errors.name}>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField label={t('organization.nameAr')}>
          <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
        </FormField>
        <FormField label={t('organization.email')}>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormField>
        <FormField label={t('organization.phone')}>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </FormField>
        <FormField label={t('organization.currency')}>
          <Input value={currency} onChange={(e) => setCurrency(e.target.value)} />
        </FormField>
        <FormField label={t('organization.status')}>
          <Select value={status} onChange={(e) => setStatus(e.target.value as OrganizationStatusValue)}>
            <option value={OrganizationStatus.Active}>{t('organization.active')}</option>
            <option value={OrganizationStatus.Inactive}>{t('organization.inactive')}</option>
          </Select>
        </FormField>
        <FormField label={t('organization.notes')} className="sm:col-span-2">
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </FormField>
      </div>
    </Dialog>
  )
}

export default OrganizationForm
