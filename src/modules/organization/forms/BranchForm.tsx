import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Dialog from '@/components/ui/Dialog'
import FormField from '@/components/forms/FormField'
import FormActions from '@/components/forms/FormActions'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import type { Branch, BranchInput, BranchStatusValue } from '@/core/models/BranchStatus'
import { BranchStatus } from '@/core/models/BranchStatus'
import type { Organization } from '@/core/models/OrganizationStatus'

export interface BranchFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  branch?: Branch | null
  organizations: Organization[]
  onSubmit: (input: BranchInput) => void
}

export function BranchForm({ open, onOpenChange, branch, organizations, onSubmit }: BranchFormProps) {
  const { t } = useTranslation('organization')
  const isEdit = !!branch

  const [code, setCode] = useState(() => branch?.code ?? '')
  const [name, setName] = useState(() => branch?.name ?? '')
  const [nameAr, setNameAr] = useState(() => branch?.nameAr ?? '')
  const [organizationId, setOrganizationId] = useState(() => branch?.organizationId ?? organizations[0]?._id ?? '')
  const [city, setCity] = useState(() => branch?.city ?? '')
  const [email, setEmail] = useState(() => branch?.email ?? '')
  const [phone, setPhone] = useState(() => branch?.phone ?? '')
  const [status, setStatus] = useState<BranchStatusValue>(() => branch?.status ?? BranchStatus.Active)
  const [notes, setNotes] = useState(() => branch?.notes ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!code.trim()) newErrors.code = 'Code is required'
    if (!name.trim()) newErrors.name = 'Name is required'
    if (!organizationId) newErrors.organization = 'Organization is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const org = organizations.find((o) => o._id === organizationId)
    if (!org) return
    onSubmit({
      code: code.trim(),
      name: name.trim(),
      nameAr: nameAr.trim() || undefined,
      organizationId: org._id,
      city: city.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      status,
      notes: notes.trim() || undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog
      key={branch?._id ?? 'new'}
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? t('branch.edit') : t('branch.create')}
      size="lg"
      footer={
        <FormActions
          submitLabel={isEdit ? t('branch.edit') : t('branch.create')}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label={t('branch.code')} required error={errors.code}>
          <Input value={code} onChange={(e) => setCode(e.target.value)} disabled={isEdit} />
        </FormField>
        <FormField label={t('branch.name')} required error={errors.name}>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField label={t('branch.nameAr')}>
          <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
        </FormField>
        <FormField label={t('branch.organization')} required error={errors.organization}>
          <Select value={organizationId} onChange={(e) => setOrganizationId(e.target.value)}>
            <option value="">--</option>
            {organizations.map((org) => (
              <option key={org._id} value={org._id}>{org.name}</option>
            ))}
          </Select>
        </FormField>
        <FormField label={t('branch.city')}>
          <Input value={city} onChange={(e) => setCity(e.target.value)} />
        </FormField>
        <FormField label={t('branch.email')}>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormField>
        <FormField label={t('branch.phone')}>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </FormField>
        <FormField label={t('branch.status')}>
          <Select value={status} onChange={(e) => setStatus(e.target.value as BranchStatusValue)}>
            <option value={BranchStatus.Active}>{t('branch.active')}</option>
            <option value={BranchStatus.Inactive}>{t('branch.inactive')}</option>
          </Select>
        </FormField>
        <FormField label={t('branch.notes')} className="sm:col-span-2">
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </FormField>
      </div>
    </Dialog>
  )
}

export default BranchForm
