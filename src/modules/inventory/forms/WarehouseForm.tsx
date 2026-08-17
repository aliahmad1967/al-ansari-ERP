import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Dialog from '@/components/ui/Dialog'
import FormField from '@/components/forms/FormField'
import FormActions from '@/components/forms/FormActions'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

export interface WarehouseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  warehouse?: {
    _id: string
    code: string
    name: string
    nameAr: string | null
    address: string | null
    addressAr: string | null
    capacity: number | null
    capacityUnit: string | null
    status: string
  } | null
  onSubmit: (input: Record<string, unknown>) => void
}

export function WarehouseForm({ open, onOpenChange, warehouse, onSubmit }: WarehouseFormProps) {
  const { t } = useTranslation('inventory')
  const isEdit = !!warehouse

  const [code, setCode] = useState(() => warehouse?.code ?? '')
  const [name, setName] = useState(() => warehouse?.name ?? '')
  const [nameAr, setNameAr] = useState(() => warehouse?.nameAr ?? '')
  const [address, setAddress] = useState(() => warehouse?.address ?? '')
  const [addressAr, setAddressAr] = useState(() => warehouse?.addressAr ?? '')
  const [capacity, setCapacity] = useState(() => warehouse?.capacity ?? '')
  const [capacityUnit, setCapacityUnit] = useState(() => warehouse?.capacityUnit ?? '')
  const [status, setStatus] = useState(() => warehouse?.status ?? 'active')
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
      address: address.trim() || undefined,
      addressAr: addressAr.trim() || undefined,
      capacity: capacity !== '' ? Number(capacity) : undefined,
      capacityUnit: capacityUnit || undefined,
      status,
    })
    onOpenChange(false)
  }

  return (
    <Dialog
      key={warehouse?._id ?? 'new'}
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? t('warehouse.edit') : t('warehouse.create')}
      size="lg"
      footer={
        <FormActions
          submitLabel={isEdit ? t('warehouse.edit') : t('warehouse.create')}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label={t('warehouse.code')} required error={errors.code}>
          <Input value={code} onChange={(e) => setCode(e.target.value)} disabled={isEdit} />
        </FormField>
        <FormField label={t('warehouse.name')} required error={errors.name}>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField label={t('warehouse.nameAr')}>
          <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} dir="rtl" />
        </FormField>
        <FormField label={t('warehouse.status')}>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">{t('warehouse.active')}</option>
            <option value="inactive">{t('warehouse.inactive')}</option>
          </Select>
        </FormField>
        <FormField label={t('warehouse.address')} className="sm:col-span-2">
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </FormField>
        <FormField label={t('warehouse.addressAr')} className="sm:col-span-2">
          <Input value={addressAr} onChange={(e) => setAddressAr(e.target.value)} dir="rtl" />
        </FormField>
        <FormField label={t('warehouse.capacity')}>
          <Input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
        </FormField>
        <FormField label={t('warehouse.capacityUnit')}>
          <Select value={capacityUnit} onChange={(e) => setCapacityUnit(e.target.value)}>
            <option value="">{t('warehouse.selectCapacityUnit')}</option>
            <option value="sqm">sqm</option>
            <option value="sqft">sqft</option>
            <option value="pallets">pallets</option>
            <option value="cbm">cbm</option>
          </Select>
        </FormField>
      </div>
    </Dialog>
  )
}

export default WarehouseForm
