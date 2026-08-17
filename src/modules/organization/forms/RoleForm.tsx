import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Dialog from '@/components/ui/Dialog'
import FormField from '@/components/forms/FormField'
import FormActions from '@/components/forms/FormActions'
import Input from '@/components/ui/Input'
import Checkbox from '@/components/ui/Checkbox'
import type { Role, RoleInput } from '@/core/models/SystemRoleCode'
import type { Permission } from '@/core/models/PermissionStatus'

export interface RoleFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: Role | null
  allPermissions: Permission[]
  onSubmit: (input: RoleInput) => void
}

export function RoleForm({ open, onOpenChange, role, allPermissions, onSubmit }: RoleFormProps) {
  const { t } = useTranslation('organization')
  const isEdit = !!role

  const [code, setCode] = useState(() => role?.code ?? '')
  const [name, setName] = useState(() => role?.name ?? '')
  const [nameAr, setNameAr] = useState(() => role?.nameAr ?? '')
  const [description, setDescription] = useState(() => role?.description ?? '')
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string>>(() => {
    if (role?.permissionIds) {
      return new Set(role.permissionIds)
    }
    return new Set()
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const togglePermission = (permId: string) => {
    setSelectedPermissionIds((prev) => {
      const next = new Set(prev)
      if (next.has(permId)) {
        next.delete(permId)
      } else {
        next.add(permId)
      }
      return next
    })
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!code.trim()) newErrors.code = 'Code is required'
    if (!name.trim()) newErrors.name = 'Name is required'
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
      permissionIds: Array.from(selectedPermissionIds),
    })
    onOpenChange(false)
  }

  const groupedPermissions = allPermissions.reduce<Record<string, Permission[]>>((acc, perm) => {
    const key = perm.module
    if (!acc[key]) acc[key] = []
    acc[key].push(perm)
    return acc
  }, {})

  return (
    <Dialog
      key={role?._id ?? 'new'}
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? t('role.edit') : t('role.create')}
      size="xl"
      footer={
        <FormActions
          submitLabel={isEdit ? t('role.edit') : t('role.create')}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label={t('role.code')} required error={errors.code}>
          <Input value={code} onChange={(e) => setCode(e.target.value)} disabled={isEdit} />
        </FormField>
        <FormField label={t('role.name')} required error={errors.name}>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField label={t('role.nameAr')}>
          <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
        </FormField>
        <FormField label={t('role.description')}>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </FormField>
      </div>

      <div className="mt-4">
        <h3 className="mb-3 text-sm font-medium text-content">{t('role.permissions')}</h3>
        <div className="max-h-64 overflow-y-auto rounded-md border border-border p-3">
          {Object.entries(groupedPermissions).map(([module, perms]) => (
            <div key={module} className="mb-3">
              <p className="mb-1 text-xs font-semibold uppercase text-content-subtle">{module}</p>
              <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
                {perms.map((perm) => (
                  <label
                    key={perm._id}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm text-content hover:bg-surface-sunken"
                  >
                    <Checkbox
                      checked={selectedPermissionIds.has(perm._id)}
                      onChange={() => togglePermission(perm._id)}
                    />
                    <span className="truncate">{perm.action}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Dialog>
  )
}

export default RoleForm
