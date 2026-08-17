import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, User, FileText } from 'lucide-react'

import Button from '@/components/ui/Button'
import PageLayout from '@/components/layout/PageLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useEmployees } from '@/modules/hr/hooks/useEmployees'
import { useContracts } from '@/modules/hr/hooks/useContracts'
import { EmployeeStatus } from '@/core/models/EmployeeStatus'
import StatusBadge from '@/components/data-display/StatusBadge'

export default function EmployeeDetailsPage() {
  const { t } = useTranslation('hr')
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { items: employees } = useEmployees()
  const { items: contracts } = useContracts(id)

  const employee = employees.find(e => e._id === id)

  if (!employee) {
    return (
      <PageLayout title={t('employee.details')}>
        <EmptyState
          icon={<User className="h-6 w-6" />}
          title={t('employee.notFound')}
          action={
            <Button onClick={() => navigate('/employees')}>
              <ArrowLeft className="h-4 w-4 me-1" />
              {t('employee.backToList')}
            </Button>
          }
        />
      </PageLayout>
    )
  }

  return (
    <RequirePermission permission="hr.employee.view">
      <PageLayout
        title={`${employee.firstName} ${employee.lastName}`}
        description={employee.employeeNumber}
        icon={<User className="h-5 w-5" />}
        breadcrumbs={
          <button onClick={() => navigate('/employees')} className="text-sm text-primary hover:underline">
            {t('employee.title')}
          </button>
        }
      >
        <div className="space-y-6">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t('employee.personalInfo')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-sm text-content-muted">{t('employee.fullName')}</p>
                  <p className="font-medium text-content">{employee.firstName} {employee.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-content-muted">{t('employee.fullNameAr')}</p>
                  <p className="font-medium text-content">{employee.firstNameAr} {employee.lastNameAr}</p>
                </div>
                <div>
                  <p className="text-sm text-content-muted">{t('employee.email')}</p>
                  <p className="font-medium text-content">{employee.email}</p>
                </div>
                <div>
                  <p className="text-sm text-content-muted">{t('employee.phone')}</p>
                  <p className="font-medium text-content">{employee.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-content-muted">{t('employee.status')}</p>
                  <StatusBadge
                    tone={employee.status === EmployeeStatus.Active ? 'success' : 'neutral'}
                    label={t(`employee.${employee.status}`)}
                  />
                </div>
                <div>
                  <p className="text-sm text-content-muted">{t('employee.nationality')}</p>
                  <p className="font-medium text-content">{employee.nationality || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-content-muted">{t('employee.gender')}</p>
                  <p className="font-medium text-content">{employee.gender || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-content-muted">{t('employee.employmentDate')}</p>
                  <p className="font-medium text-content">{new Date(employee.employmentDate).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contracts */}
          <Card>
            <CardHeader>
              <CardTitle>{t('contract.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              {contracts.length === 0 ? (
                <EmptyState icon={<FileText className="h-6 w-6" />} title={t('contract.empty')} className="py-6" />
              ) : (
                <div className="space-y-2">
                  {contracts.map((contract) => (
                    <div key={contract._id} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div>
                        <p className="font-medium text-content">{contract.contractNumber}</p>
                        <p className="text-sm text-content-muted">{contract.type} • {new Date(contract.startDate).toLocaleDateString()}</p>
                      </div>
                      <StatusBadge
                        tone={contract.status === 'active' ? 'success' : 'neutral'}
                        label={t(`contract.${contract.status}`)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    </RequirePermission>
  )
}
