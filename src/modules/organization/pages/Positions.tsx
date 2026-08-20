import { useState, useMemo } from 'react'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { useTranslation } from 'react-i18next'
import { Briefcase, Plus } from 'lucide-react'

import Button from '@/components/ui/Button'
import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import Dialog from '@/components/ui/Dialog'
import FormActions from '@/components/forms/FormActions'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { usePositions } from '@/modules/organization/hooks/usePositions'
import type { Position } from '@/core/models/PositionStatus'
import { useDepartments } from '@/modules/organization/hooks/useDepartments'
import PositionForm from '@/modules/organization/forms/PositionForm'
import { PositionStatus } from '@/core/models/PositionStatus'

export default function PositionsPage() {
  const { t } = useTranslation('organization')
  const { items: positions, loading, create, update, archive } = usePositions()
  const { items: departments } = useDepartments()

  const { search, setSearch, debouncedSearch, page, setPage } = useDebouncedSearch()
  const [pageSize, setPageSize] = useState(10)
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<Position | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<Position | null>(null)

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return positions
    const q = debouncedSearch.toLowerCase()
    return positions.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        (item.titleAr ?? '').includes(debouncedSearch),
    )
  }, [positions, debouncedSearch])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const columns: DataTableColumn<Position>[] = [
    { key: 'code', header: t('position.code'), sortable: true, width: '100px' },
    { key: 'title', header: t('position.titleField'), sortable: true },
    { key: 'titleAr', header: t('position.titleAr') },
    {
      key: 'departmentId',
      header: t('position.department'),
      render: (row) => departments.find((d) => d._id === row.departmentId)?.name ?? '-',
    },
    { key: 'grade', header: t('position.grade') },
    {
      key: 'status',
      header: t('position.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={row.status === PositionStatus.Active ? 'success' : 'neutral'}
          label={row.status === PositionStatus.Active ? t('position.active') : t('position.inactive')}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '120px',
      render: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditItem(row); setFormOpen(true) }}>
            {t('position.edit')}
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setArchiveTarget(row) }}>
            {t('position.archive')}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <RequirePermission permission="organization.department.view">
      <PageLayout
        title={t('position.title')}
        description={t('position.description')}
        icon={<Briefcase className="h-5 w-5" />}
        actions={
          <RequirePermission permission="organization.department.create">
            <Button onClick={() => { setEditItem(null); setFormOpen(true) }}>
              <Plus className="h-4 w-4 me-1" aria-hidden="true" />
              {t('position.create')}
            </Button>
          </RequirePermission>
        }
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('filters.searchPositions')}
          />
        </div>

        <DataTable
          columns={columns}
          data={paginated}
          rowKey={(row) => row._id}
          loading={loading}
          onRowClick={(row) => { setEditItem(row); setFormOpen(true) }}
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

        <PositionForm
          open={formOpen}
          onOpenChange={setFormOpen}
          position={editItem}
          departments={departments}
          onSubmit={(input) => {
            if (editItem) {
              update(editItem._id, input)
            } else {
              create(input)
            }
          }}
        />

        <Dialog
          open={!!archiveTarget}
          onOpenChange={(open) => { if (!open) setArchiveTarget(null) }}
          title={t('position.archive')}
          footer={
            <FormActions
              submitLabel={t('position.archive')}
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
          <p className="text-sm text-content-muted">{t('position.confirmArchive')}</p>
        </Dialog>
      </PageLayout>
    </RequirePermission>
  )
}
