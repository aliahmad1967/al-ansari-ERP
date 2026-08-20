import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { Clock, Plus } from 'lucide-react'

import Button from '@/components/ui/Button'
import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import Dialog from '@/components/ui/Dialog'
import FormActions from '@/components/forms/FormActions'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useTimesheets } from '@/modules/projects/hooks/useTimesheets'
import { TimesheetStatus } from '@/core/models/TimesheetStatus'

export default function Timesheets() {
  const { t } = useTranslation('projects')
  const { items: timesheets, loading, create, archive } = useTimesheets()

  const { search, setSearch, debouncedSearch, page, setPage } = useDebouncedSearch()
  const [pageSize, setPageSize] = useState(10)
  const [archiveTarget, setArchiveTarget] = useState<(typeof timesheets)[0] | null>(null)

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return timesheets
    const q = debouncedSearch.toLowerCase()
    return timesheets.filter(
      (item) =>
        (item.description ?? '').toLowerCase().includes(q) ||
        (item.descriptionAr ?? '').includes(debouncedSearch),
    )
  }, [timesheets, debouncedSearch])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const totalHours = useMemo(() => filtered.reduce((sum, t) => sum + t.hours, 0), [filtered])
  const billableHours = useMemo(() => filtered.filter((t) => t.billable).reduce((sum, t) => sum + t.hours, 0), [filtered])

  const statusTone = (status: string) => {
    switch (status) {
      case TimesheetStatus.Approved: return 'success'
      case TimesheetStatus.Submitted: return 'info'
      case TimesheetStatus.Rejected: return 'danger'
      default: return 'neutral'
    }
  }

  const columns: DataTableColumn<(typeof timesheets)[0]>[] = [
    {
      key: 'date',
      header: t('timesheet.date'),
      sortable: true,
      render: (row) => new Date(row.date).toLocaleDateString(),
    },
    {
      key: 'employeeId',
      header: t('timesheet.employee'),
      render: (row) => <span className="text-sm text-content-muted">{row.employeeId}</span>,
    },
    {
      key: 'hours',
      header: t('timesheet.hours'),
      sortable: true,
      render: (row) => <span className="font-medium">{row.hours}h</span>,
    },
    {
      key: 'description',
      header: t('timesheet.description_label'),
      render: (row) => (
        <div>
          <p className="text-sm">{row.description || '-'}</p>
          {row.descriptionAr && <p className="text-xs text-content-muted">{row.descriptionAr}</p>}
        </div>
      ),
    },
    {
      key: 'billable',
      header: t('timesheet.billable'),
      render: (row) => (
        <StatusBadge
          tone={row.billable ? 'success' : 'neutral'}
          label={row.billable ? t('timesheet.billable') : '-'}
        />
      ),
    },
    {
      key: 'status',
      header: t('timesheet.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={statusTone(row.status) as 'success' | 'info' | 'danger' | 'neutral'}
          label={t(`timesheet.statuses.${row.status}`)}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '100px',
      render: (row) => (
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setArchiveTarget(row) }}>
          {t('timesheet.archive')}
        </Button>
      ),
    },
  ]

  return (
    <RequirePermission permission="projects.timesheet.view">
      <PageLayout
        title={t('timesheet.title')}
        description={t('timesheet.description')}
        icon={<Clock className="h-5 w-5" />}
        actions={
          <RequirePermission permission="projects.timesheet.create">
            <Button onClick={() => create({ projectId: '', employeeId: '', date: new Date(), hours: 0 })}>
              <Plus className="h-4 w-4 me-1" aria-hidden="true" />
              {t('timesheet.create')}
            </Button>
          </RequirePermission>
        }
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 mb-6">
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-content-muted">{t('timesheet.summary.totalHours')}</p>
            <p className="text-2xl font-semibold">{totalHours}h</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-content-muted">{t('timesheet.summary.billableHours')}</p>
            <p className="text-2xl font-semibold">{billableHours}h</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-content-muted">{t('timesheet.summary.entries')}</p>
            <p className="text-2xl font-semibold">{filtered.length}</p>
          </div>
        </div>

        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('filters.searchTasks')}
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

        <Dialog
          open={!!archiveTarget}
          onOpenChange={(open) => { if (!open) setArchiveTarget(null) }}
          title={t('timesheet.archive')}
          footer={
            <FormActions
              submitLabel={t('timesheet.archive')}
              cancelLabel="Cancel"
              onCancel={() => setArchiveTarget(null)}
              onSubmit={() => {
                if (archiveTarget) {
                  archive(archiveTarget._id)
                  setArchiveTarget(null)
                }
              }}
            />
          }
        >
          <p className="text-sm text-content-muted">{t('timesheet.confirmArchive')}</p>
        </Dialog>
      </PageLayout>
    </RequirePermission>
  )
}
