import { useState, useMemo } from 'react'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { useTranslation } from 'react-i18next'
import { Calendar, Plus, Check, X } from 'lucide-react'

import Button from '@/components/ui/Button'
import PageLayout from '@/components/layout/PageLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import Dialog from '@/components/ui/Dialog'
import FormField from '@/components/forms/FormField'
import FormActions from '@/components/forms/FormActions'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useLeave } from '@/modules/attendance/hooks/useAttendance'
import { useEmployees } from '@/modules/hr/hooks/useEmployees'

export default function LeavePage() {
  const { t } = useTranslation('attendance')
  const { types, requests, balances, loading, createRequest, approveRequest, rejectRequest, cancelRequest } = useLeave()
  const { items: employees } = useEmployees()

  const { search, setSearch, debouncedSearch, page, setPage } = useDebouncedSearch()
  const [pageSize, setPageSize] = useState(10)
  const [formOpen, setFormOpen] = useState(false)
  const [approveTarget, setApproveTarget] = useState<Record<string, unknown> | null>(null)
  const [rejectTarget, setRejectTarget] = useState<Record<string, unknown> | null>(null)
  const [comment, setComment] = useState('')
  const [rejectReason, setRejectReason] = useState('')

  const [newReq, setNewReq] = useState({ employeeId: '', leaveTypeId: '', startDate: '', endDate: '', totalDays: 1, reason: '' })

  const empMap = useMemo(() => {
    const m = new Map<string, { firstName: string; lastName: string }>()
    for (const e of employees) m.set(e._id, e)
    return m
  }, [employees])

  const typeMap = useMemo(() => {
    const m = new Map<string, { name: string; nameAr: string | null }>()
    for (const t of types) { const lt = t as Record<string, unknown>; m.set(lt._id as string, { name: lt.name as string, nameAr: lt.nameAr as string | null }) }
    return m
  }, [types])

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return requests
    const q = debouncedSearch.toLowerCase()
    return requests.filter((r: Record<string, unknown>) => {
      const emp = empMap.get(r.employeeId as string)
      return emp?.firstName.toLowerCase().includes(q) || emp?.lastName.toLowerCase().includes(q) || (r.status as string).includes(q)
    })
  }, [requests, debouncedSearch, empMap])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statusTone = (s: string) => {
    if (s === 'approved') return 'success'
    if (s === 'rejected' || s === 'cancelled') return 'danger'
    if (s.includes('pending')) return 'warning'
    return 'neutral'
  }

  const columns: DataTableColumn<Record<string, unknown>>[] = [
    {
      key: 'employeeId', header: t('leave.employee'), render: (r) => {
        const emp = empMap.get(r.employeeId as string)
        return emp ? `${emp.firstName} ${emp.lastName}` : r.employeeId as string
      },
    },
    {
      key: 'leaveTypeId', header: t('leave.type'), render: (r) => {
        const lt = typeMap.get(r.leaveTypeId as string)
        return lt?.name ?? r.leaveTypeId as string
      },
    },
    { key: 'startDate', header: t('leave.startDate'), render: (r) => new Date(r.startDate as string).toLocaleDateString() },
    { key: 'endDate', header: t('leave.endDate'), render: (r) => new Date(r.endDate as string).toLocaleDateString() },
    { key: 'totalDays', header: t('leave.days'), sortable: true },
    { key: 'reason', header: t('leave.reason'), render: (r) => (r.reason as string) || '-' },
    {
      key: 'status', header: t('leave.status'), sortable: true, render: (r) => (
        <StatusBadge tone={statusTone(r.status as string)} label={t(`leave.${r.status}`)} />
      ),
    },
    {
      key: 'actions', header: '', width: '140px', render: (r) => {
        const status = r.status as string
        return (
          <div className="flex gap-1">
            {(status === 'pending_manager' || status === 'pending_hr') && (
              <>
                <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setApproveTarget(r); setComment('') }}>
                  <Check className="h-4 w-4 text-success" />
                </Button>
                <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setRejectTarget(r); setRejectReason('') }}>
                  <X className="h-4 w-4 text-danger" />
                </Button>
              </>
            )}
            {status === 'pending_manager' && (
              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); cancelRequest(r._id as string) }}>
                {t('leave.cancel')}
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  const handleSubmitRequest = () => {
    if (!newReq.employeeId || !newReq.leaveTypeId || !newReq.startDate || !newReq.endDate) return
    createRequest(newReq)
    setFormOpen(false)
    setNewReq({ employeeId: '', leaveTypeId: '', startDate: '', endDate: '', totalDays: 1, reason: '' })
  }

  const handleApprove = () => {
    if (!approveTarget) return
    const level = approveTarget.status === 'pending_manager' ? 'manager' : 'hr'
    approveRequest(approveTarget._id as string, level, 'current-user', 'Current User', comment)
    setApproveTarget(null)
  }

  const handleReject = () => {
    if (!rejectTarget || !rejectReason.trim()) return
    const level = rejectTarget.status === 'pending_manager' ? 'manager' : 'hr'
    rejectRequest(rejectTarget._id as string, level, 'current-user', 'Current User', rejectReason)
    setRejectTarget(null)
  }

  return (
    <RequirePermission permission="hr.leave.view">
      <PageLayout
        title={t('leave.title')}
        description={t('leave.description')}
        icon={<Calendar className="h-5 w-5" />}
        actions={
          <RequirePermission permission="hr.leave.create">
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 me-1" /> {t('leave.newRequest')}
            </Button>
          </RequirePermission>
        }
      >
        <div className="space-y-6">
          {balances.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(balances as Record<string, unknown>[]).map((b) => {
                const lt = typeMap.get(b.leaveTypeId as string)
                const total = (b.totalDays as number) + (b.carriedOverDays as number)
                const used = b.usedDays as number
                const remaining = total - used
                return (
                  <Card key={b._id as string}>
                    <CardContent className="p-4">
                      <p className="text-sm text-content-muted">{lt?.name ?? 'Leave'}</p>
                      <p className="text-2xl font-bold text-content">{remaining}</p>
                      <p className="text-xs text-content-muted">{t('leave.remainingDays')} ({used}/{total} {t('leave.used')})</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          <div className="mb-4">
            <SearchInput
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              onClear={() => { setSearch(''); setPage(1) }}
              placeholder={t('leave.searchPlaceholder')}
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
                pageSizeOptions={[5, 10, 25]}
                onPageSizeChange={(s) => { setPageSize(s); setPage(1) }}
              />
            }
          />
        </div>

        <Dialog open={formOpen} onOpenChange={setFormOpen} title={t('leave.newRequest')} size="lg"
          footer={<FormActions submitLabel={t('leave.submit')} onCancel={() => setFormOpen(false)} onSubmit={handleSubmitRequest} />}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label={t('leave.employee')} required>
              <Select value={newReq.employeeId} onChange={(e) => setNewReq({ ...newReq, employeeId: e.target.value })}>
                <option value="">{t('leave.selectEmployee')}</option>
                {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
              </Select>
            </FormField>
            <FormField label={t('leave.type')} required>
              <Select value={newReq.leaveTypeId} onChange={(e) => setNewReq({ ...newReq, leaveTypeId: e.target.value })}>
                <option value="">{t('leave.selectType')}</option>
                {(types as Record<string, unknown>[]).map(lt => <option key={lt._id as string} value={lt._id as string}>{lt.name as string}</option>)}
              </Select>
            </FormField>
            <FormField label={t('leave.startDate')} required>
              <Input type="date" value={newReq.startDate} onChange={(e) => setNewReq({ ...newReq, startDate: e.target.value })} />
            </FormField>
            <FormField label={t('leave.endDate')} required>
              <Input type="date" value={newReq.endDate} onChange={(e) => setNewReq({ ...newReq, endDate: e.target.value })} />
            </FormField>
            <FormField label={t('leave.days')} required>
              <Input type="number" value={newReq.totalDays} onChange={(e) => setNewReq({ ...newReq, totalDays: parseInt(e.target.value) || 1 })} min="1" />
            </FormField>
            <FormField label={t('leave.reason')} className="sm:col-span-2">
              <Input value={newReq.reason} onChange={(e) => setNewReq({ ...newReq, reason: e.target.value })} />
            </FormField>
          </div>
        </Dialog>

        <Dialog open={!!approveTarget} onOpenChange={(o) => { if (!o) setApproveTarget(null) }} title={t('leave.approveTitle')}
          footer={<FormActions submitLabel={t('leave.approve')} onCancel={() => setApproveTarget(null)} onSubmit={handleApprove} />}>
          <FormField label={t('leave.comment')}>
            <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t('leave.commentOptional')} />
          </FormField>
        </Dialog>

        <Dialog open={!!rejectTarget} onOpenChange={(o) => { if (!o) setRejectTarget(null) }} title={t('leave.rejectTitle')}
          footer={<FormActions submitLabel={t('leave.reject')} onCancel={() => setRejectTarget(null)} onSubmit={handleReject} />}>
          <FormField label={t('leave.rejectionReason')} required>
            <Input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          </FormField>
        </Dialog>
      </PageLayout>
    </RequirePermission>
  )
}
