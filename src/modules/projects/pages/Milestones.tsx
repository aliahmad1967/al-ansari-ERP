import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Flag, Plus } from 'lucide-react'

import Button from '@/components/ui/Button'
import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import Dialog from '@/components/ui/Dialog'
import FormActions from '@/components/forms/FormActions'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useMilestones } from '@/modules/projects/hooks/useMilestones'
import { MilestoneStatus } from '@/core/models/Milestone'

export default function Milestones() {
  const { t } = useTranslation('projects')
  const { items: milestones, loading, create, archive } = useMilestones()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [archiveTarget, setArchiveTarget] = useState<(typeof milestones)[0] | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return milestones
    const q = search.toLowerCase()
    return milestones.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.nameAr ?? '').includes(search),
    )
  }, [milestones, search])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statusTone = (status: string) => {
    switch (status) {
      case MilestoneStatus.Achieved: return 'success'
      case MilestoneStatus.InProgress: return 'primary'
      case MilestoneStatus.Missed: return 'danger'
      default: return 'neutral'
    }
  }

  const columns: DataTableColumn<(typeof milestones)[0]>[] = [
    {
      key: 'name',
      header: t('milestone.name'),
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-content">{row.name}</p>
          {row.nameAr && <p className="text-sm text-content-muted">{row.nameAr}</p>}
        </div>
      ),
    },
    {
      key: 'status',
      header: t('milestone.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={statusTone(row.status) as 'success' | 'primary' | 'danger' | 'neutral'}
          label={t(`milestone.statuses.${row.status}`)}
        />
      ),
    },
    {
      key: 'dueDate',
      header: t('milestone.dueDate'),
      sortable: true,
      render: (row) => (
        <div>
          <span>{new Date(row.dueDate).toLocaleDateString()}</span>
          {row.status !== 'achieved' && new Date() > new Date(row.dueDate) && (
            <span className="ms-2 text-xs text-danger">{t('filters.overdue')}</span>
          )}
        </div>
      ),
    },
    {
      key: 'completedAt',
      header: t('milestone.completedAt'),
      render: (row) => row.completedAt ? new Date(row.completedAt).toLocaleDateString() : '-',
    },
    {
      key: 'actions',
      header: '',
      width: '100px',
      render: (row) => (
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setArchiveTarget(row) }}>
          {t('milestone.archive')}
        </Button>
      ),
    },
  ]

  return (
    <RequirePermission permission="projects.milestone.view">
      <PageLayout
        title={t('milestone.title')}
        description={t('milestone.description')}
        icon={<Flag className="h-5 w-5" />}
        actions={
          <RequirePermission permission="projects.milestone.create">
            <Button onClick={() => create({ projectId: '', name: 'New Milestone', dueDate: new Date() })}>
              <Plus className="h-4 w-4 me-1" aria-hidden="true" />
              {t('milestone.create')}
            </Button>
          </RequirePermission>
        }
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('filters.searchProjects')}
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
          title={t('milestone.archive')}
          footer={
            <FormActions
              submitLabel={t('milestone.archive')}
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
          <p className="text-sm text-content-muted">{t('milestone.confirmArchive')}</p>
        </Dialog>
      </PageLayout>
    </RequirePermission>
  )
}
