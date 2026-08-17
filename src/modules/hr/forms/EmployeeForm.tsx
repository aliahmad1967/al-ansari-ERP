import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Dialog from '@/components/ui/Dialog'
import FormField from '@/components/forms/FormField'
import FormActions from '@/components/forms/FormActions'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { EmployeeStatus, type EmployeeStatusValue } from '@/core/models/EmployeeStatus'

export interface EmployeeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee?: {
    _id: string
    employeeNumber: string
    firstName: string
    lastName: string
    firstNameAr: string | null
    lastNameAr: string | null
    email: string
    phone: string | null
    dateOfBirth: string | null
    gender: string | null
    nationality: string | null
    nationalId: string | null
    maritalStatus: string | null
    address: string | null
    city: string | null
    country: string | null
    departmentId: string | null
    positionId: string | null
    managerId: string | null
    employmentDate: string
    status: string
    notes: string | null
  } | null
  onSubmit: (input: Record<string, unknown>) => void
}

export function EmployeeForm({ open, onOpenChange, employee, onSubmit }: EmployeeFormProps) {
  const { t } = useTranslation('hr')
  const isEdit = !!employee

  const [employeeNumber, setEmployeeNumber] = useState(() => employee?.employeeNumber ?? '')
  const [firstName, setFirstName] = useState(() => employee?.firstName ?? '')
  const [lastName, setLastName] = useState(() => employee?.lastName ?? '')
  const [firstNameAr, setFirstNameAr] = useState(() => employee?.firstNameAr ?? '')
  const [lastNameAr, setLastNameAr] = useState(() => employee?.lastNameAr ?? '')
  const [email, setEmail] = useState(() => employee?.email ?? '')
  const [phone, setPhone] = useState(() => employee?.phone ?? '')
  const [dateOfBirth, setDateOfBirth] = useState(() => employee?.dateOfBirth?.split('T')[0] ?? '')
  const [gender, setGender] = useState(() => employee?.gender ?? '')
  const [nationality, setNationality] = useState(() => employee?.nationality ?? '')
  const [nationalId, setNationalId] = useState(() => employee?.nationalId ?? '')
  const [maritalStatus, setMaritalStatus] = useState(() => employee?.maritalStatus ?? '')
  const [address, setAddress] = useState(() => employee?.address ?? '')
  const [city, setCity] = useState(() => employee?.city ?? '')
  const [country, setCountry] = useState(() => employee?.country ?? '')
  const [employmentDate, setEmploymentDate] = useState(() => employee?.employmentDate?.split('T')[0] ?? '')
  const [status, setStatus] = useState<EmployeeStatusValue>(() => (employee?.status as EmployeeStatusValue) ?? EmployeeStatus.Active)
  const [notes, setNotes] = useState(() => employee?.notes ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!employeeNumber.trim()) newErrors.employeeNumber = 'Required'
    if (!firstName.trim()) newErrors.firstName = 'Required'
    if (!lastName.trim()) newErrors.lastName = 'Required'
    if (!email.trim()) newErrors.email = 'Required'
    if (!employmentDate) newErrors.employmentDate = 'Required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSubmit({
      employeeNumber: employeeNumber.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      firstNameAr: firstNameAr.trim() || undefined,
      lastNameAr: lastNameAr.trim() || undefined,
      email: email.trim(),
      phone: phone.trim() || undefined,
      dateOfBirth: dateOfBirth || undefined,
      gender: gender || undefined,
      nationality: nationality.trim() || undefined,
      nationalId: nationalId.trim() || undefined,
      maritalStatus: maritalStatus || undefined,
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      country: country.trim() || undefined,
      employmentDate,
      status,
      notes: notes.trim() || undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog
      key={employee?._id ?? 'new'}
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? t('employee.edit') : t('employee.create')}
      size="lg"
      footer={
        <FormActions
          submitLabel={isEdit ? t('employee.edit') : t('employee.create')}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label={t('employee.number')} required error={errors.employeeNumber}>
          <Input value={employeeNumber} onChange={(e) => setEmployeeNumber(e.target.value)} disabled={isEdit} />
        </FormField>
        <FormField label={t('employee.firstName')} required error={errors.firstName}>
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </FormField>
        <FormField label={t('employee.lastName')} required error={errors.lastName}>
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </FormField>
        <FormField label={t('employee.firstNameAr')}>
          <Input value={firstNameAr} onChange={(e) => setFirstNameAr(e.target.value)} dir="rtl" />
        </FormField>
        <FormField label={t('employee.lastNameAr')}>
          <Input value={lastNameAr} onChange={(e) => setLastNameAr(e.target.value)} dir="rtl" />
        </FormField>
        <FormField label={t('employee.email')} required error={errors.email}>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormField>
        <FormField label={t('employee.phone')}>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </FormField>
        <FormField label={t('employee.dateOfBirth')}>
          <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
        </FormField>
        <FormField label={t('employee.gender')}>
          <Select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">--</option>
            <option value="male">{t('employee.male')}</option>
            <option value="female">{t('employee.female')}</option>
          </Select>
        </FormField>
        <FormField label={t('employee.nationality')}>
          <Input value={nationality} onChange={(e) => setNationality(e.target.value)} />
        </FormField>
        <FormField label={t('employee.nationalId')}>
          <Input value={nationalId} onChange={(e) => setNationalId(e.target.value)} />
        </FormField>
        <FormField label={t('employee.maritalStatus')}>
          <Select value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)}>
            <option value="">--</option>
            <option value="single">{t('employee.single')}</option>
            <option value="married">{t('employee.married')}</option>
            <option value="divorced">{t('employee.divorced')}</option>
            <option value="widowed">{t('employee.widowed')}</option>
          </Select>
        </FormField>
        <FormField label={t('employee.employmentDate')} required error={errors.employmentDate}>
          <Input type="date" value={employmentDate} onChange={(e) => setEmploymentDate(e.target.value)} />
        </FormField>
        <FormField label={t('employee.status')}>
          <Select value={status} onChange={(e) => setStatus(e.target.value as EmployeeStatusValue)}>
            <option value={EmployeeStatus.Active}>{t('employee.active')}</option>
            <option value={EmployeeStatus.Inactive}>{t('employee.inactive')}</option>
            <option value={EmployeeStatus.Suspended}>{t('employee.suspended')}</option>
            <option value={EmployeeStatus.Terminated}>{t('employee.terminated')}</option>
          </Select>
        </FormField>
        <FormField label={t('employee.city')}>
          <Input value={city} onChange={(e) => setCity(e.target.value)} />
        </FormField>
        <FormField label={t('employee.country')}>
          <Input value={country} onChange={(e) => setCountry(e.target.value)} />
        </FormField>
        <FormField label={t('employee.address')} className="sm:col-span-2">
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </FormField>
        <FormField label={t('employee.notes')} className="sm:col-span-2">
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </FormField>
      </div>
    </Dialog>
  )
}

export default EmployeeForm
