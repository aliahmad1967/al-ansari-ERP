import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Building2, Plus } from 'lucide-react'

import Button from '@/components/ui/Button'
import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import Dialog from '@/components/ui/Dialog'
import FormActions from '@/components/forms/FormActions'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { formatDate } from '@/lib/format'
import { useOrganizations } from '@/modules/organization/hooks/useOrganizations'
import OrganizationForm from '@/modules/organization/forms/OrganizationForm'
import type { Organization } from '@/core/models/Organization'
import { OrganizationStatus } from '@/core/models/Organization'

export default function OrganizationsPage() {
  const { t } = useTranslation('organization')
  const { items, loading, create, update, archive } = useOrganizations()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<Organization | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<Organization | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        (item.nameAr ?? '').includes(search),
    )
  }, [items, search])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const columns: DataTableColumn<Organization>[] = [
    { key: 'code', header: t('organization.code'), sortable: true, width: '100px' },
    { key: 'name', header: t('organization.name'), sortable: true },
    { key: 'nameAr', header: t('organization.nameAr') },
    { key: 'email', header: t('organization.email') },
    {
      key: 'status',
      header: t('organization.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={row.status === OrganizationStatus.Active ? 'success' : 'neutral'}
          label={row.status === OrganizationStatus.Active ? t('organization.active') : t('organization.inactive')}
        />
      ),
    },
    {
      key: 'createdAt',
      header: t('organization.createdAt'),
      sortable: true,
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: 'actions',
      header: '',
      width: '120px',
      render: (row) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); setEditItem(row); setFormOpen(true) }}
          >
            {t('organization.edit')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); setArchiveTarget(row) }}
          >
            {t('organization.archive')}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <RequirePermission permission="organization.organization.view">
      <PageLayout
        title={t('organization.title')}
        description={t('organization.description')}
        icon={<Building2 className="h-5 w-5" />}
        actions={
          <RequirePermission permission="organization.organization.create">
            <Button onClick={() => { setEditItem(null); setFormOpen(true) }}>
              <Plus className="h-4 w-4 me-1" aria-hidden="true" />
              {t('organization.create')}
            </Button>
          </RequirePermission>
        }
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('filters.search')}
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

        <OrganizationForm
          open={formOpen}
          onOpenChange={setFormOpen}
          organization={editItem}
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
          title={t('organization.archive')}
          footer={
            <FormActions
              submitLabel={t('organization.archive')}
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
          <p className="text-sm text-content-muted">{t('organization.confirmArchive')}</p>
        </Dialog>
      </PageLayout>
    </RequirePermission>
  )
}
