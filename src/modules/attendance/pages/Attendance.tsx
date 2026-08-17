import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Clock, LogIn, LogOut } from 'lucide-react'

import Button from '@/components/ui/Button'
import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useAttendance } from '@/modules/attendance/hooks/useAttendance'
import { useEmployees } from '@/modules/hr/hooks/useEmployees'

export default function AttendancePage() {
  const { t } = useTranslation('attendance')
  const { attendance, loading, checkIn, checkOut } = useAttendance()
  const { items: employees } = useEmployees()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)

  const empMap = useMemo(() => {
    const m = new Map<string, { firstName: string; lastName: string; employeeNumber: string }>()
    for (const e of employees) m.set(e._id, e)
    return m
  }, [employees])

  const filtered = useMemo(() => {
    if (!search.trim()) return attendance
    const q = search.toLowerCase()
    return attendance.filter((r: Record<string, unknown>) => {
      const emp = empMap.get(r.employeeId as string)
      if (!emp) return false
      return emp.firstName.toLowerCase().includes(q) || emp.lastName.toLowerCase().includes(q) || emp.employeeNumber.toLowerCase().includes(q)
    })
  }, [attendance, search, empMap])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const columns: DataTableColumn<Record<string, unknown>>[] = [
    { key: 'date', header: t('attendance.date'), sortable: true, render: (r) => new Date(r.date as string).toLocaleDateString() },
    {
      key: 'employeeId', header: t('attendance.employee'), render: (r) => {
        const emp = empMap.get(r.employeeId as string)
        return emp ? `${emp.firstName} ${emp.lastName}` : r.employeeId as string
      },
    },
    { key: 'checkIn', header: t('attendance.checkIn'), render: (r) => r.checkIn ? new Date(r.checkIn as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-' },
    { key: 'checkOut', header: t('attendance.checkOut'), render: (r) => r.checkOut ? new Date(r.checkOut as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-' },
    { key: 'workingHours', header: t('attendance.workingHours'), sortable: true, render: (r) => `${r.workingHours ?? 0}h` },
    { key: 'lateMinutes', header: t('attendance.late'), render: (r) => (r.lateMinutes as number) > 0 ? `${r.lateMinutes}m` : '-' },
    { key: 'earlyDepartureMinutes', header: t('attendance.earlyDeparture'), render: (r) => (r.earlyDepartureMinutes as number) > 0 ? `${r.earlyDepartureMinutes}m` : '-' },
    { key: 'overtimeMinutes', header: t('attendance.overtime'), render: (r) => (r.overtimeMinutes as number) > 0 ? `${r.overtimeMinutes}m` : '-' },
    {
      key: 'status', header: t('attendance.status'), sortable: true, render: (r) => {
        const status = r.status as string
        const tone = status === 'present' ? 'success' : status === 'late' ? 'warning' : status === 'absent' ? 'danger' : 'neutral'
        return <StatusBadge tone={tone} label={t(`attendance.${status}`)} />
      },
    },
  ]

  return (
    <RequirePermission permission="hr.attendance.view">
      <PageLayout
        title={t('attendance.title')}
        description={t('attendance.description')}
        icon={<Clock className="h-5 w-5" />}
        actions={
          <div className="flex gap-2">
            <Button onClick={() => checkIn('EMP-001', 'manual')}>
              <LogIn className="h-4 w-4 me-1" /> {t('attendance.checkInBtn')}
            </Button>
            <Button variant="outline" onClick={() => checkOut('EMP-001')}>
              <LogOut className="h-4 w-4 me-1" /> {t('attendance.checkOutBtn')}
            </Button>
          </div>
        }
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('attendance.searchPlaceholder')}
          />
        </div>

        <DataTable
          columns={columns}
          data={paginated}
          rowKey={(r) => (r._id as string)}
          loading={loading}
          footer={
            <Pagination
              page={page}
              pageSize={pageSize}
              totalItems={filtered.length}
              onPageChange={setPage}
              pageSizeOptions={[10, 15, 25, 50]}
              onPageSizeChange={(s) => { setPageSize(s); setPage(1) }}
            />
          }
        />
      </PageLayout>
    </RequirePermission>
  )
}
