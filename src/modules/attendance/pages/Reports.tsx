import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart3 } from 'lucide-react'

import PageLayout from '@/components/layout/PageLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useAttendance } from '@/modules/attendance/hooks/useAttendance'
import { useLeave } from '@/modules/attendance/hooks/useAttendance'
import { useEmployees } from '@/modules/hr/hooks/useEmployees'

export default function AttendanceReportsPage() {
  const { t } = useTranslation('attendance')
  const { attendance } = useAttendance()
  const { requests, types } = useLeave()
  const { items: employees } = useEmployees()

  const typeMap = useMemo(() => {
    const m = new Map<string, string>()
    for (const lt of types) { const r = lt as Record<string, unknown>; m.set(r._id as string, r.name as string) }
    return m
  }, [types])

  const empMap = useMemo(() => {
    const m = new Map<string, string>()
    for (const e of employees) m.set(e._id, `${e.firstName} ${e.lastName}`)
    return m
  }, [employees])

  const stats = useMemo(() => {
    const records = attendance as Record<string, unknown>[]
    const total = records.length
    const present = records.filter(r => r.status === 'present').length
    const late = records.filter(r => r.status === 'late').length
    const absent = records.filter(r => r.status === 'absent').length
    const earlyDeparture = records.filter(r => r.status === 'early_departure').length
    const avgHours = total > 0 ? records.reduce((s, r) => s + (r.workingHours as number ?? 0), 0) / total : 0
    const totalOvertime = records.reduce((s, r) => s + (r.overtimeMinutes as number ?? 0), 0)
    const totalLateMinutes = records.reduce((s, r) => s + (r.lateMinutes as number ?? 0), 0)

    const leaveReqs = requests as Record<string, unknown>[]
    const pending = leaveReqs.filter(r => (r.status as string).includes('pending')).length
    const approved = leaveReqs.filter(r => r.status === 'approved').length
    const rejected = leaveReqs.filter(r => r.status === 'rejected').length

    return { total, present, late, absent, earlyDeparture, avgHours, totalOvertime, totalLateMinutes, pending, approved, rejected }
  }, [attendance, requests])

  return (
    <RequirePermission permission="hr.attendance.view">
      <PageLayout
        title={t('reports.title')}
        description={t('reports.description')}
        icon={<BarChart3 className="h-5 w-5" />}
      >
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-content">{t('reports.attendanceSummary')}</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <Card><CardContent className="p-4"><p className="text-sm text-content-muted">{t('reports.totalRecords')}</p><p className="text-2xl font-bold text-content">{stats.total}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-content-muted">{t('reports.present')}</p><p className="text-2xl font-bold text-success">{stats.present}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-content-muted">{t('reports.late')}</p><p className="text-2xl font-bold text-warning">{stats.late}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-content-muted">{t('reports.absent')}</p><p className="text-2xl font-bold text-danger">{stats.absent}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-content-muted">{t('reports.earlyDeparture')}</p><p className="text-2xl font-bold text-warning">{stats.earlyDeparture}</p></CardContent></Card>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <Card><CardContent className="p-4"><p className="text-sm text-content-muted">{t('reports.avgHours')}</p><p className="text-2xl font-bold text-content">{stats.avgHours.toFixed(1)}h</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-content-muted">{t('reports.totalOvertime')}</p><p className="text-2xl font-bold text-primary">{Math.round(stats.totalOvertime / 60)}h</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-content-muted">{t('reports.totalLateness')}</p><p className="text-2xl font-bold text-warning">{Math.round(stats.totalLateMinutes / 60)}h</p></CardContent></Card>
          </div>

          <h3 className="text-lg font-semibold text-content">{t('reports.leaveSummary')}</h3>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-3 lg:grid-cols-3">
            <Card><CardContent className="p-4"><p className="text-sm text-content-muted">{t('reports.pending')}</p><p className="text-2xl font-bold text-warning">{stats.pending}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-content-muted">{t('reports.approved')}</p><p className="text-2xl font-bold text-success">{stats.approved}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-content-muted">{t('reports.rejected')}</p><p className="text-2xl font-bold text-danger">{stats.rejected}</p></CardContent></Card>
          </div>

          <h3 className="text-lg font-semibold text-content">{t('reports.leaveHistory')}</h3>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-surface-secondary">
                    <th className="px-4 py-3 text-start font-medium text-content-muted">{t('leave.employee')}</th>
                    <th className="px-4 py-3 text-start font-medium text-content-muted">{t('leave.type')}</th>
                    <th className="px-4 py-3 text-start font-medium text-content-muted">{t('leave.startDate')}</th>
                    <th className="px-4 py-3 text-start font-medium text-content-muted">{t('leave.endDate')}</th>
                    <th className="px-4 py-3 text-start font-medium text-content-muted">{t('leave.days')}</th>
                    <th className="px-4 py-3 text-start font-medium text-content-muted">{t('leave.status')}</th>
                  </tr></thead>
                  <tbody>
                    {(requests as Record<string, unknown>[]).slice(0, 20).map((r) => (
                      <tr key={r._id as string} className="border-b border-border">
                        <td className="px-4 py-3 text-content">{empMap.get(r.employeeId as string) ?? r.employeeId as string}</td>
                        <td className="px-4 py-3 text-content">{typeMap.get(r.leaveTypeId as string) ?? r.leaveTypeId as string}</td>
                        <td className="px-4 py-3 text-content">{new Date(r.startDate as string).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-content">{new Date(r.endDate as string).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-content">{r.totalDays as number}</td>
                        <td className="px-4 py-3 text-content">{r.status as string}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    </RequirePermission>
  )
}
