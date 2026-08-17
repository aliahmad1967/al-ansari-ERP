import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Dialog from '@/components/ui/Dialog'
import FormField from '@/components/forms/FormField'
import FormActions from '@/components/forms/FormActions'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

export interface ContractFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contract?: {
    _id: string
    employeeId: string
    contractNumber: string
    type: string
    startDate: string
    endDate: string | null
    salary: number | null
    status: string
    notes: string | null
  } | null
  employeeId?: string
  onSubmit: (input: Record<string, unknown>) => void
}

export function ContractForm({ open, onOpenChange, contract, employeeId, onSubmit }: ContractFormProps) {
  const { t } = useTranslation('hr')
  const isEdit = !!contract

  const [contractNumber, setContractNumber] = useState(() => contract?.contractNumber ?? '')
  const [type, setType] = useState(() => contract?.type ?? 'full-time')
  const [startDate, setStartDate] = useState(() => contract?.startDate?.split('T')[0] ?? '')
  const [endDate, setEndDate] = useState(() => contract?.endDate?.split('T')[0] ?? '')
  const [salary, setSalary] = useState(() => contract?.salary?.toString() ?? '')
  const [status, setStatus] = useState(() => contract?.status ?? 'active')
  const [notes, setNotes] = useState(() => contract?.notes ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!contractNumber.trim()) newErrors.contractNumber = 'Required'
    if (!startDate) newErrors.startDate = 'Required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSubmit({
      employeeId: employeeId ?? contract?.employeeId,
      contractNumber: contractNumber.trim(),
      type,
      startDate,
      endDate: endDate || undefined,
      salary: salary ? parseFloat(salary) : undefined,
      status,
      notes: notes.trim() || undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog
      key={contract?._id ?? 'new'}
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? t('contract.edit') : t('contract.create')}
      footer={
        <FormActions
          submitLabel={isEdit ? t('contract.edit') : t('contract.create')}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label={t('contract.number')} required error={errors.contractNumber}>
          <Input value={contractNumber} onChange={(e) => setContractNumber(e.target.value)} disabled={isEdit} />
        </FormField>
        <FormField label={t('contract.type')}>
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="full-time">{t('contract.fullTime')}</option>
            <option value="part-time">{t('contract.partTime')}</option>
            <option value="contract">{t('contract.contract')}</option>
            <option value="internship">{t('contract.internship')}</option>
          </Select>
        </FormField>
        <FormField label={t('contract.startDate')} required error={errors.startDate}>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </FormField>
        <FormField label={t('contract.endDate')}>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </FormField>
        <FormField label={t('contract.salary')}>
          <Input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} min="0" step="0.01" />
        </FormField>
        <FormField label={t('contract.status')}>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">{t('contract.active')}</option>
            <option value="expired">{t('contract.expired')}</option>
            <option value="terminated">{t('contract.terminated')}</option>
          </Select>
        </FormField>
        <FormField label={t('contract.notes')} className="sm:col-span-2">
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </FormField>
      </div>
    </Dialog>
  )
}

export default ContractForm
