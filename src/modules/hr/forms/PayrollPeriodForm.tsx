import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Dialog from '@/components/ui/Dialog'
import FormField from '@/components/forms/FormField'
import FormActions from '@/components/forms/FormActions'
import Input from '@/components/ui/Input'

export interface PayrollPeriodFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: Record<string, unknown>) => void
}

export function PayrollPeriodForm({ open, onOpenChange, onSubmit }: PayrollPeriodFormProps) {
  const { t } = useTranslation('hr')

  const now = new Date()
  const [name, setName] = useState('')
  const [nameAr, setNameAr] = useState('')
  const [startDate, setStartDate] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`)
  const [endDate, setEndDate] = useState('')
  const [year, setYear] = useState(String(now.getFullYear()))
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'Required'
    if (!startDate) newErrors.startDate = 'Required'
    if (!endDate) newErrors.endDate = 'Required'
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      newErrors.endDate = 'End date must be after start date'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSubmit({
      name: name.trim(),
      nameAr: nameAr.trim() || undefined,
      startDate,
      endDate,
      year: parseInt(year, 10),
      month: parseInt(month, 10),
    })
    onOpenChange(false)
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('payrollPeriod.create')}
      size="lg"
      footer={
        <FormActions
          submitLabel={t('payrollPeriod.create')}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label={t('payrollPeriod.name')} required error={errors.name}>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('payrollPeriod.namePlaceholder')} />
        </FormField>
        <FormField label={t('payrollPeriod.nameAr')}>
          <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} dir="rtl" />
        </FormField>
        <FormField label={t('payrollPeriod.year')} required>
          <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} />
        </FormField>
        <FormField label={t('payrollPeriod.month')} required>
          <select
            className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
            value={month}
            onChange={(e) => {
              const m = e.target.value
              setMonth(m)
              const monthNum = parseInt(m, 10)
              if (monthNum && year) {
                const lastDay = new Date(parseInt(year, 10), monthNum, 0).getDate()
                setEndDate(`${year}-${String(monthNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`)
                setStartDate(`${year}-${String(monthNum).padStart(2, '0')}-01`)
              }
            }}
          >
            {monthNames.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
        </FormField>
        <FormField label={t('payrollPeriod.startDate')} required error={errors.startDate}>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </FormField>
        <FormField label={t('payrollPeriod.endDate')} required error={errors.endDate}>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </FormField>
      </div>
    </Dialog>
  )
}

export default PayrollPeriodForm
