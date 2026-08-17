import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Dialog from '@/components/ui/Dialog'
import FormField from '@/components/forms/FormField'
import FormActions from '@/components/forms/FormActions'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import type { User, UserInput, UserStatusValue } from '@/core/models/UserStatus'
import { UserStatus } from '@/core/models/UserStatus'
import type { Role } from '@/core/models/SystemRoleCode'
import type { Organization } from '@/core/models/OrganizationStatus'
import type { Branch } from '@/core/models/BranchStatus'
import type { Department } from '@/core/models/DepartmentStatus'

export interface UserFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
  roles: Role[]
  organizations: Organization[]
  branches: Branch[]
  departments: Department[]
  onSubmit: (input: UserInput & { password?: string }) => void
}

export function UserForm({ open, onOpenChange, user, roles, organizations, branches, departments, onSubmit }: UserFormProps) {
  const { t } = useTranslation('organization')
  const isEdit = !!user

  const [username, setUsername] = useState(() => user?.username ?? '')
  const [email, setEmail] = useState(() => user?.email ?? '')
  const [fullName, setFullName] = useState(() => user?.fullName ?? '')
  const [fullNameAr, setFullNameAr] = useState(() => user?.fullNameAr ?? '')
  const [phone, setPhone] = useState(() => user?.phone ?? '')
  const [password, setPassword] = useState('')
  const [roleId, setRoleId] = useState(() => user?.roleId ?? '')
  const [organizationId, setOrganizationId] = useState(() => user?.organizationId ?? organizations[0]?._id ?? '')
  const [branchId, setBranchId] = useState(() => user?.branchId ?? '')
  const [departmentId, setDepartmentId] = useState(() => user?.departmentId ?? '')
  const [status, setStatus] = useState<UserStatusValue>(() => user?.status ?? UserStatus.Active)
  const [notes, setNotes] = useState(() => user?.notes ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!username.trim()) newErrors.username = 'Username is required'
    if (!email.trim()) newErrors.email = 'Email is required'
    if (!fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!isEdit && !password.trim()) newErrors.password = t('user.passwordRequired')
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const role = roleId ? roles.find((r) => r._id === roleId) ?? undefined : undefined
    const org = organizationId ? organizations.find((o) => o._id === organizationId) ?? undefined : undefined
    const branch = branchId ? branches.find((b) => b._id === branchId) ?? undefined : undefined
    const department = departmentId ? departments.find((d) => d._id === departmentId) ?? undefined : undefined
    onSubmit({
      username: username.trim(),
      email: email.trim(),
      fullName: fullName.trim(),
      fullNameAr: fullNameAr.trim() || undefined,
      phone: phone.trim() || undefined,
      password: password || undefined,
      roleId: role?._id,
      organizationId: org?._id,
      branchId: branch?._id,
      departmentId: department?._id,
      status,
      notes: notes.trim() || undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog
      key={user?._id ?? 'new'}
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? t('user.edit') : t('user.create')}
      size="lg"
      footer={
        <FormActions
          submitLabel={isEdit ? t('user.edit') : t('user.create')}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label={t('user.username')} required error={errors.username}>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} disabled={isEdit} />
        </FormField>
        <FormField label={t('user.email')} required error={errors.email}>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormField>
        <FormField label={t('user.fullName')} required error={errors.fullName}>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </FormField>
        <FormField label={t('user.fullNameAr')}>
          <Input value={fullNameAr} onChange={(e) => setFullNameAr(e.target.value)} />
        </FormField>
        <FormField label={t('user.phone')}>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </FormField>
        {!isEdit && (
          <FormField label={t('user.password')} required error={errors.password}>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormField>
        )}
        <FormField label={t('user.role')}>
          <Select value={roleId} onChange={(e) => setRoleId(e.target.value)}>
            <option value="">--</option>
            {roles.map((r) => (
              <option key={r._id} value={r._id}>{r.name}</option>
            ))}
          </Select>
        </FormField>
        <FormField label={t('user.organization')}>
          <Select value={organizationId} onChange={(e) => setOrganizationId(e.target.value)}>
            <option value="">--</option>
            {organizations.map((o) => (
              <option key={o._id} value={o._id}>{o.name}</option>
            ))}
          </Select>
        </FormField>
        <FormField label={t('user.branch')}>
          <Select value={branchId} onChange={(e) => setBranchId(e.target.value)}>
            <option value="">--</option>
            {branches.map((b) => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </Select>
        </FormField>
        <FormField label={t('user.department')}>
          <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
            <option value="">--</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </Select>
        </FormField>
        <FormField label={t('user.status')}>
          <Select value={status} onChange={(e) => setStatus(e.target.value as UserStatusValue)}>
            <option value={UserStatus.Active}>{t('user.active')}</option>
            <option value={UserStatus.Inactive}>{t('user.inactive')}</option>
            <option value={UserStatus.Suspended}>{t('user.suspended')}</option>
          </Select>
        </FormField>
        <FormField label={t('user.notes')} className="sm:col-span-2">
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </FormField>
      </div>
    </Dialog>
  )
}

export default UserForm
