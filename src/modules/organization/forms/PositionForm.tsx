import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Dialog from '@/components/ui/Dialog'
import FormField from '@/components/forms/FormField'
import FormActions from '@/components/forms/FormActions'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import type { Position, PositionInput, PositionStatusValue } from '@/core/models/PositionStatus'
import { PositionStatus } from '@/core/models/PositionStatus'
import type { Department } from '@/core/models/DepartmentStatus'

export interface PositionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  position?: Position | null
  departments: Department[]
  onSubmit: (input: PositionInput) => void
}

export function PositionForm({ open, onOpenChange, position, departments, onSubmit }: PositionFormProps) {
  const { t } = useTranslation('organization')
  const isEdit = !!position

  const [code, setCode] = useState(() => position?.code ?? '')
  const [title, setTitle] = useState(() => position?.title ?? '')
  const [titleAr, setTitleAr] = useState(() => position?.titleAr ?? '')
  const [departmentId, setDepartmentId] = useState(() => position?.departmentId ?? departments[0]?._id ?? '')
  const [grade, setGrade] = useState(() => position?.grade ?? '')
  const [status, setStatus] = useState<PositionStatusValue>(() => position?.status ?? PositionStatus.Active)
  const [notes, setNotes] = useState(() => position?.notes ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!code.trim()) newErrors.code = 'Code is required'
    if (!title.trim()) newErrors.title = 'Title is required'
    if (!departmentId) newErrors.department = 'Department is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const dept = departments.find((d) => d._id === departmentId)
    if (!dept) return
    onSubmit({
      code: code.trim(),
      title: title.trim(),
      titleAr: titleAr.trim() || undefined,
      departmentId: dept._id,
      grade: grade.trim() || undefined,
      status,
      notes: notes.trim() || undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog
      key={position?._id ?? 'new'}
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? t('position.edit') : t('position.create')}
      size="lg"
      footer={
        <FormActions
          submitLabel={isEdit ? t('position.edit') : t('position.create')}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label={t('position.code')} required error={errors.code}>
          <Input value={code} onChange={(e) => setCode(e.target.value)} disabled={isEdit} />
        </FormField>
        <FormField label={t('position.titleField')} required error={errors.title}>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </FormField>
        <FormField label={t('position.titleAr')}>
          <Input value={titleAr} onChange={(e) => setTitleAr(e.target.value)} />
        </FormField>
        <FormField label={t('position.department')} required error={errors.department}>
          <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
            <option value="">--</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </Select>
        </FormField>
        <FormField label={t('position.grade')}>
          <Input value={grade} onChange={(e) => setGrade(e.target.value)} />
        </FormField>
        <FormField label={t('position.status')}>
          <Select value={status} onChange={(e) => setStatus(e.target.value as PositionStatusValue)}>
            <option value={PositionStatus.Active}>{t('position.active')}</option>
            <option value={PositionStatus.Inactive}>{t('position.inactive')}</option>
          </Select>
        </FormField>
        <FormField label={t('position.notes')} className="sm:col-span-2">
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </FormField>
      </div>
    </Dialog>
  )
}

export default PositionForm
