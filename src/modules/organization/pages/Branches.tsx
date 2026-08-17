import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { GitBranch, Plus } from 'lucide-react'

import Button from '@/components/ui/Button'
import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import Dialog from '@/components/ui/Dialog'
import FormActions from '@/components/forms/FormActions'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useBranches } from '@/modules/organization/hooks/useBranches'
import { useOrganizations } from '@/modules/organization/hooks/useOrganizations'
import BranchForm from '@/modules/organization/forms/BranchForm'
import type { Branch } from '@/core/models/Branch'
import { BranchStatus } from '@/core/models/Branch'

export default function BranchesPage() {
  const { t } = useTranslation('organization')
  const { items: branches, loading, create, update, archive } = useBranches()
  const { items: organizations } = useOrganizations()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<Branch | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<Branch | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return branches
    const q = search.toLowerCase()
    return branches.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        (item.nameAr ?? '').includes(search),
    )
  }, [branches, search])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const columns: DataTableColumn<Branch>[] = [
    { key: 'code', header: t('branch.code'), sortable: true, width: '100px' },
    { key: 'name', header: t('branch.name'), sortable: true },
    { key: 'nameAr', header: t('branch.nameAr') },
    {
      key: 'organization',
      header: t('branch.organization'),
      render: (row) => row.organization?.name ?? '-',
    },
    { key: 'city', header: t('branch.city') },
    {
      key: 'status',
      header: t('branch.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={row.status === BranchStatus.Active ? 'success' : 'neutral'}
          label={row.status === BranchStatus.Active ? t('branch.active') : t('branch.inactive')}
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
            {t('branch.edit')}
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setArchiveTarget(row) }}>
            {t('branch.archive')}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <RequirePermission permission="organization.branch.view">
      <PageLayout
        title={t('branch.title')}
        description={t('branch.description')}
        icon={<GitBranch className="h-5 w-5" />}
        actions={
          <RequirePermission permission="organization.branch.create">
            <Button onClick={() => { setEditItem(null); setFormOpen(true) }}>
              <Plus className="h-4 w-4 me-1" aria-hidden="true" />
              {t('branch.create')}
            </Button>
          </RequirePermission>
        }
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('filters.searchBranches')}
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

        <BranchForm
          open={formOpen}
          onOpenChange={setFormOpen}
          branch={editItem}
          organizations={organizations}
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
          title={t('branch.archive')}
          footer={
            <FormActions
              submitLabel={t('branch.archive')}
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
          <p className="text-sm text-content-muted">{t('branch.confirmArchive')}</p>
        </Dialog>
      </PageLayout>
    </RequirePermission>
  )
}
