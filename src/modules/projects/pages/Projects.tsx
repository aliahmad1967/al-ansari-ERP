import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { FolderKanban, Plus } from 'lucide-react'

import Button from '@/components/ui/Button'
import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import Dialog from '@/components/ui/Dialog'
import FormActions from '@/components/forms/FormActions'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useProjects } from '@/modules/projects/hooks/useProjects'
import { ProjectStatus } from '@/core/models/ProjectStatus'

export default function Projects() {
  const { t } = useTranslation('projects')
  const { items: projects, loading, create, archive } = useProjects()

  const { search, setSearch, debouncedSearch, page, setPage } = useDebouncedSearch()
  const [pageSize, setPageSize] = useState(10)
  const [archiveTarget, setArchiveTarget] = useState<(typeof projects)[0] | null>(null)

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return projects
    const q = debouncedSearch.toLowerCase()
    return projects.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.projectCode.toLowerCase().includes(q) ||
        (item.nameAr ?? '').includes(debouncedSearch) ||
        (item.description ?? '').toLowerCase().includes(q),
    )
  }, [projects, debouncedSearch])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statusTone = (status: string) => {
    switch (status) {
      case ProjectStatus.Active:
        return 'success'
      case ProjectStatus.OnHold:
        return 'warning'
      case ProjectStatus.Completed:
        return 'info'
      case ProjectStatus.Cancelled:
        return 'danger'
      default:
        return 'neutral'
    }
  }

  const columns: DataTableColumn<(typeof projects)[0]>[] = [
    { key: 'projectCode', header: t('project.code'), sortable: true, width: '120px' },
    {
      key: 'name',
      header: t('project.name'),
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
      header: t('project.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={statusTone(row.status) as 'success' | 'warning' | 'info' | 'danger' | 'neutral'}
          label={t(`project.statuses.${row.status}`)}
        />
      ),
    },
    {
      key: 'priority',
      header: t('project.priority'),
      sortable: true,
      render: (row) => (
        <span className="text-sm text-content-muted">{t(`project.priorities.${row.priority}`)}</span>
      ),
    },
    {
      key: 'progress',
      header: t('project.progress'),
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-24 overflow-hidden rounded-full bg-border">
            <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, row.progress)}%` }} />
          </div>
          <span className="text-sm text-content-muted">{Math.round(row.progress)}%</span>
        </div>
      ),
    },
    {
      key: 'budget',
      header: t('project.budget'),
      sortable: true,
      render: (row) => (
        <span className="text-sm text-content-muted">
          {row.budget > 0 ? `${row.spentBudget.toLocaleString()} / ${row.budget.toLocaleString()}` : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '120px',
      render: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setArchiveTarget(row) }}>
            {t('project.archive')}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <RequirePermission permission="projects.project.view">
      <PageLayout
        title={t('project.title')}
        description={t('project.description')}
        icon={<FolderKanban className="h-5 w-5" />}
        actions={
          <RequirePermission permission="projects.project.create">
            <Button onClick={() => create({ projectCode: `PRJ-${Date.now()}`, name: 'New Project' })}>
              <Plus className="h-4 w-4 me-1" aria-hidden="true" />
              {t('project.create')}
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
          onRowClick={(row) => { window.location.href = `/projects/${row._id}` }}
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
          title={t('project.archive')}
          footer={
            <FormActions
              submitLabel={t('project.archive')}
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
          <p className="text-sm text-content-muted">{t('project.confirmArchive')}</p>
        </Dialog>
      </PageLayout>
    </RequirePermission>
  )
}
