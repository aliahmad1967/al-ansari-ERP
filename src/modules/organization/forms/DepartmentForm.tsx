import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Dialog from '@/components/ui/Dialog'
import FormField from '@/components/forms/FormField'
import FormActions from '@/components/forms/FormActions'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import type { Department, DepartmentInput, DepartmentStatusValue } from '@/core/models/DepartmentStatus'
import { DepartmentStatus } from '@/core/models/DepartmentStatus'
import type { Branch } from '@/core/models/BranchStatus'
import type { User } from '@/core/models/UserStatus'

export interface DepartmentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  department?: Department | null
  branches: Branch[]
  users: User[]
  onSubmit: (input: DepartmentInput) => void
}

export function DepartmentForm({ open, onOpenChange, department, branches, users, onSubmit }: DepartmentFormProps) {
  const { t } = useTranslation('organization')
  const isEdit = !!department

  const [code, setCode] = useState(() => department?.code ?? '')
  const [name, setName] = useState(() => department?.name ?? '')
  const [nameAr, setNameAr] = useState(() => department?.nameAr ?? '')
  const [branchId, setBranchId] = useState(() => department?.branchId ?? branches[0]?._id ?? '')
  const [managerId, setManagerId] = useState(() => department?.managerId ?? '')
  const [status, setStatus] = useState<DepartmentStatusValue>(() => department?.status ?? DepartmentStatus.Active)
  const [notes, setNotes] = useState(() => department?.notes ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!code.trim()) newErrors.code = 'Code is required'
    if (!name.trim()) newErrors.name = 'Name is required'
    if (!branchId) newErrors.branch = 'Branch is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const branch = branches.find((b) => b._id === branchId)
    if (!branch) return
    const manager = managerId ? users.find((u) => u._id === managerId) ?? undefined : undefined
    onSubmit({
      code: code.trim(),
      name: name.trim(),
      nameAr: nameAr.trim() || undefined,
      branchId: branch._id,
      managerId: manager?._id,
      status,
      notes: notes.trim() || undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog
      key={department?._id ?? 'new'}
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? t('department.edit') : t('department.create')}
      size="lg"
      footer={
        <FormActions
          submitLabel={isEdit ? t('department.edit') : t('department.create')}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label={t('department.code')} required error={errors.code}>
          <Input value={code} onChange={(e) => setCode(e.target.value)} disabled={isEdit} />
        </FormField>
        <FormField label={t('department.name')} required error={errors.name}>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField label={t('department.nameAr')}>
          <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
        </FormField>
        <FormField label={t('department.branch')} required error={errors.branch}>
          <Select value={branchId} onChange={(e) => setBranchId(e.target.value)}>
            <option value="">--</option>
            {branches.map((b) => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </Select>
        </FormField>
        <FormField label={t('department.manager')}>
          <Select value={managerId} onChange={(e) => setManagerId(e.target.value)}>
            <option value="">--</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>{u.fullName}</option>
            ))}
          </Select>
        </FormField>
        <FormField label={t('department.status')}>
          <Select value={status} onChange={(e) => setStatus(e.target.value as DepartmentStatusValue)}>
            <option value={DepartmentStatus.Active}>{t('department.active')}</option>
            <option value={DepartmentStatus.Inactive}>{t('department.inactive')}</option>
          </Select>
        </FormField>
        <FormField label={t('department.notes')} className="sm:col-span-2">
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </FormField>
      </div>
    </Dialog>
  )
}

export default DepartmentForm
