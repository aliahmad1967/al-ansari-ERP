import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { CheckSquare, Plus } from 'lucide-react'

import Button from '@/components/ui/Button'
import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import Dialog from '@/components/ui/Dialog'
import FormActions from '@/components/forms/FormActions'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useTasks } from '@/modules/projects/hooks/useTasks'
import { TaskStatus } from '@/core/models/TaskStatus'

export default function Tasks() {
  const { t } = useTranslation('projects')
  const { items: tasks, loading, create, archive } = useTasks()

  const { search, setSearch, debouncedSearch, page, setPage } = useDebouncedSearch()
  const [pageSize, setPageSize] = useState(10)
  const [archiveTarget, setArchiveTarget] = useState<(typeof tasks)[0] | null>(null)

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return tasks
    const q = debouncedSearch.toLowerCase()
    return tasks.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.taskCode.toLowerCase().includes(q) ||
        (item.titleAr ?? '').includes(debouncedSearch),
    )
  }, [tasks, debouncedSearch])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statusTone = (status: string) => {
    switch (status) {
      case TaskStatus.Done: return 'success'
      case TaskStatus.InProgress: return 'primary'
      case TaskStatus.InReview: return 'info'
      case TaskStatus.Cancelled: return 'danger'
      default: return 'neutral'
    }
  }

  const columns: DataTableColumn<(typeof tasks)[0]>[] = [
    { key: 'taskCode', header: t('task.code'), sortable: true, width: '100px' },
    {
      key: 'title',
      header: t('task.title_label'),
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-content">{row.title}</p>
          {row.titleAr && <p className="text-sm text-content-muted">{row.titleAr}</p>}
        </div>
      ),
    },
    {
      key: 'status',
      header: t('task.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={statusTone(row.status) as 'success' | 'primary' | 'info' | 'danger' | 'neutral'}
          label={t(`task.statuses.${row.status}`)}
        />
      ),
    },
    {
      key: 'priority',
      header: t('task.priority'),
      sortable: true,
      render: (row) => <span className="text-sm text-content-muted">{t(`task.priorities.${row.priority}`)}</span>,
    },
    {
      key: 'dueDate',
      header: t('task.dueDate'),
      sortable: true,
      render: (row) => row.dueDate ? new Date(row.dueDate).toLocaleDateString() : '-',
    },
    {
      key: 'loggedHours',
      header: t('task.loggedHours'),
      render: (row) => <span className="text-sm text-content-muted">{row.loggedHours}h / {row.estimatedHours}h</span>,
    },
    {
      key: 'actions',
      header: '',
      width: '100px',
      render: (row) => (
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setArchiveTarget(row) }}>
          {t('task.archive')}
        </Button>
      ),
    },
  ]

  return (
    <RequirePermission permission="projects.task.view">
      <PageLayout
        title={t('task.title')}
        description={t('task.description')}
        icon={<CheckSquare className="h-5 w-5" />}
        actions={
          <RequirePermission permission="projects.task.create">
            <Button onClick={() => create({ taskCode: `TSK-${Date.now()}`, title: 'New Task', projectId: '' })}>
              <Plus className="h-4 w-4 me-1" aria-hidden="true" />
              {t('task.create')}
            </Button>
          </RequirePermission>
        }
      >
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
          title={t('task.archive')}
          footer={
            <FormActions
              submitLabel={t('task.archive')}
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
          <p className="text-sm text-content-muted">{t('task.confirmArchive')}</p>
        </Dialog>
      </PageLayout>
    </RequirePermission>
  )
}
