import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Dialog from '@/components/ui/Dialog'
import FormField from '@/components/forms/FormField'
import FormActions from '@/components/forms/FormActions'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

export interface SalaryStructureFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  structure?: {
    _id: string
    code: string
    name: string
    nameAr: string | null
    description: string | null
    descriptionAr: string | null
    isDefault: boolean
    isActive: boolean
  } | null
  onSubmit: (input: Record<string, unknown>) => void
}

export function SalaryStructureForm({ open, onOpenChange, structure, onSubmit }: SalaryStructureFormProps) {
  const { t } = useTranslation('hr')
  const isEdit = !!structure

  const [code, setCode] = useState(() => structure?.code ?? '')
  const [name, setName] = useState(() => structure?.name ?? '')
  const [nameAr, setNameAr] = useState(() => structure?.nameAr ?? '')
  const [description, setDescription] = useState(() => structure?.description ?? '')
  const [descriptionAr, setDescriptionAr] = useState(() => structure?.descriptionAr ?? '')
  const [isActive, setIsActive] = useState(() => structure?.isActive ?? true)
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
      description: description.trim() || undefined,
      descriptionAr: descriptionAr.trim() || undefined,
      isActive,
    })
    onOpenChange(false)
  }

  return (
    <Dialog
      key={structure?._id ?? 'new'}
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? t('salaryStructure.edit') : t('salaryStructure.create')}
      size="lg"
      footer={
        <FormActions
          submitLabel={isEdit ? t('salaryStructure.edit') : t('salaryStructure.create')}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label={t('salaryStructure.code')} required error={errors.code}>
          <Input value={code} onChange={(e) => setCode(e.target.value)} disabled={isEdit} />
        </FormField>
        <FormField label={t('salaryStructure.name')} required error={errors.name}>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField label={t('salaryStructure.nameAr')}>
          <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} dir="rtl" />
        </FormField>
        <FormField label={t('salaryStructure.status')}>
          <Select value={isActive ? 'active' : 'inactive'} onChange={(e) => setIsActive(e.target.value === 'active')}>
            <option value="active">{t('salaryStructure.active')}</option>
            <option value="inactive">{t('salaryStructure.inactive')}</option>
          </Select>
        </FormField>
        <FormField label={t('salaryStructure.description')} className="sm:col-span-2">
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </FormField>
        <FormField label={t('salaryStructure.descriptionAr')} className="sm:col-span-2">
          <Input value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} dir="rtl" />
        </FormField>
      </div>
    </Dialog>
  )
}

export default SalaryStructureForm
