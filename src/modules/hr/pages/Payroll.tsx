import { useState, useMemo } from 'react'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { useTranslation } from 'react-i18next'
import { Calculator, Plus, Play, Eye, CheckCircle, Lock, RotateCcw } from 'lucide-react'

import Button from '@/components/ui/Button'
import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import Dialog from '@/components/ui/Dialog'
import FormActions from '@/components/forms/FormActions'
import FormField from '@/components/forms/FormField'
import Input from '@/components/ui/Input'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { usePayrollRuns } from '@/modules/hr/hooks/usePayrollRuns'
import { usePayrollPeriods } from '@/modules/hr/hooks/usePayrollPeriods'

export default function Payroll() {
  const { t } = useTranslation('hr')
  const { runs, loading, createRun, calculateRun, reviewRun, approveRun, finalizeRun, reverseRun } = usePayrollRuns()
  const { items: periods } = usePayrollPeriods()

  const { search, setSearch, debouncedSearch, page, setPage } = useDebouncedSearch()
  const [pageSize, setPageSize] = useState(10)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [runNotes, setRunNotes] = useState('')
  const [reverseDialogTarget, setReverseDialogTarget] = useState<typeof runs[0] | null>(null)
  const [reverseReason, setReverseReason] = useState('')

  const periodMap = useMemo(() => {
    const map = new Map<string, typeof periods[0]>()
    for (const p of periods) map.set(p._id, p)
    return map
  }, [periods])

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return runs
    const q = debouncedSearch.toLowerCase()
    return runs.filter((item) => {
      const period = periodMap.get(item.periodId)
      return (
        String(item.runNumber).includes(q) ||
        item.status.toLowerCase().includes(q) ||
        (period?.name ?? '').toLowerCase().includes(q) ||
        (period?.nameAr ?? '').includes(debouncedSearch) ||
        (item.notes ?? '').toLowerCase().includes(q)
      )
    })
  }, [runs, debouncedSearch, periodMap])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statusTone = (status: string) => {
    switch (status) {
      case 'draft': return 'neutral' as const
      case 'calculating': return 'warning' as const
      case 'calculated': return 'info' as const
      case 'reviewing': return 'info' as const
      case 'approved': return 'success' as const
      case 'finalized': return 'success' as const
      case 'reversed': return 'warning' as const
      default: return 'neutral' as const
    }
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)

  const columns: DataTableColumn<typeof runs[0]>[] = [
    {
      key: 'runNumber',
      header: t('payrollRun.runNumber'),
      sortable: true,
      width: '100px',
      render: (row) => <span className="font-mono text-sm">#{row.runNumber}</span>,
    },
    {
      key: 'periodId',
      header: t('payrollRun.period'),
      render: (row) => {
        const period = periodMap.get(row.periodId)
        return (
          <div>
            <p className="font-medium text-content text-sm">{period?.name ?? '-'}</p>
            {period?.nameAr && <p className="text-xs text-content-muted">{period.nameAr}</p>}
          </div>
        )
      },
    },
    {
      key: 'status',
      header: t('payrollRun.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge tone={statusTone(row.status)} label={t(`payrollRun.statusValues.${row.status}`)} />
      ),
    },
    {
      key: 'employeeCount',
      header: t('payrollRun.employees'),
      sortable: true,
      render: (row) => <span className="text-sm">{row.employeeCount}</span>,
    },
    {
      key: 'totalGross',
      header: t('payrollRun.totalGross'),
      sortable: true,
      render: (row) => <span className="text-sm font-mono">{formatCurrency(row.totalGross)}</span>,
    },
    {
      key: 'totalDeductions',
      header: t('payrollRun.totalDeductions'),
      sortable: true,
      render: (row) => <span className="text-sm font-mono text-red-600">{formatCurrency(row.totalDeductions)}</span>,
    },
    {
      key: 'totalNet',
      header: t('payrollRun.totalNet'),
      sortable: true,
      render: (row) => <span className="text-sm font-mono font-semibold">{formatCurrency(row.totalNet)}</span>,
    },
    {
      key: 'actions',
      header: '',
      width: '200px',
      render: (row) => (
        <div className="flex gap-1 flex-wrap">
          {row.status === 'draft' && (
            <RequirePermission permission="hr.payroll.approve">
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); calculateRun(row._id) }}>
                <Play className="h-3 w-3 me-1" />{t('payrollRun.calculate')}
              </Button>
            </RequirePermission>
          )}
          {row.status === 'calculated' && (
            <RequirePermission permission="hr.payroll.approve">
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); reviewRun(row._id) }}>
                <Eye className="h-3 w-3 me-1" />{t('payrollRun.review')}
              </Button>
            </RequirePermission>
          )}
          {row.status === 'reviewing' && (
            <RequirePermission permission="hr.payroll.approve">
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); approveRun(row._id, 'admin') }}>
                <CheckCircle className="h-3 w-3 me-1" />{t('payrollRun.approve')}
              </Button>
            </RequirePermission>
          )}
          {row.status === 'approved' && (
            <RequirePermission permission="hr.payroll.approve">
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); finalizeRun(row._id, 'admin') }}>
                <Lock className="h-3 w-3 me-1" />{t('payrollRun.finalize')}
              </Button>
            </RequirePermission>
          )}
          {row.status === 'finalized' && (
            <RequirePermission permission="hr.payroll.approve">
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setReverseDialogTarget(row); setReverseReason('') }}>
                <RotateCcw className="h-3 w-3 me-1" />{t('payrollRun.reverse')}
              </Button>
            </RequirePermission>
          )}
        </div>
      ),
    },
  ]

  return (
    <RequirePermission permission="hr.payroll.view">
      <PageLayout
        title={t('payrollRun.title')}
        description={t('payrollRun.description')}
        icon={<Calculator className="h-5 w-5" />}
        actions={
          <RequirePermission permission="hr.payroll.create">
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 me-1" aria-hidden="true" />
              {t('payrollRun.create')}
            </Button>
          </RequirePermission>
        }
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('payrollRun.searchPlaceholder')}
          />
        </div>

        <DataTable
          columns={columns}
          data={paginated}
          rowKey={(row) => row._id}
          loading={loading}
          footer={
            <Pagination
              page={page}
              pageSize={pageSize}
              totalItems={filtered.length}
              onPageChange={setPage}
              pageSizeOptions={[5, 10, 25, 50]}
              onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
            />
          }
        />

        {/* Create Run Dialog */}
        <Dialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          title={t('payrollRun.create')}
          footer={
            <FormActions
              submitLabel={t('payrollRun.create')}
              onCancel={() => setCreateDialogOpen(false)}
              onSubmit={() => {
                if (selectedPeriod) {
                  createRun(selectedPeriod, runNotes || undefined)
                  setCreateDialogOpen(false)
                  setSelectedPeriod('')
                  setRunNotes('')
                }
              }}
            />
          }
        >
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('payrollRun.selectPeriod')}</label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="">{t('payrollRun.selectPeriodPlaceholder')}</option>
                {periods.filter(p => p.status !== 'closed').map((p) => (
                  <option key={p._id} value={p._id}>{p.name} {p.nameAr ? `(${p.nameAr})` : ''}</option>
                ))}
              </select>
            </div>
            <FormField label={t('payrollRun.notes')}>
              <Input value={runNotes} onChange={(e) => setRunNotes(e.target.value)} placeholder={t('payrollRun.notesPlaceholder')} />
            </FormField>
          </div>
        </Dialog>

        {/* Reverse Dialog */}
        <Dialog
          open={!!reverseDialogTarget}
          onOpenChange={(open) => { if (!open) { setReverseDialogTarget(null); setReverseReason('') } }}
          title={t('payrollRun.reverseConfirm')}
          footer={
            <FormActions
              submitLabel={t('payrollRun.reverse')}
              onCancel={() => { setReverseDialogTarget(null); setReverseReason('') }}
              onSubmit={() => {
                if (reverseDialogTarget && reverseReason.trim()) {
                  reverseRun(reverseDialogTarget._id, reverseReason.trim(), 'admin')
                  setReverseDialogTarget(null)
                  setReverseReason('')
                }
              }}
            />
          }
        >
          <div className="grid grid-cols-1 gap-4">
            <p className="text-sm text-content-muted">{t('payrollRun.reverseWarning')}</p>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('payrollRun.reverseReason')} *</label>
              <Input value={reverseReason} onChange={(e) => setReverseReason(e.target.value)} />
            </div>
          </div>
        </Dialog>
      </PageLayout>
    </RequirePermission>
  )
}
