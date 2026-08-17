import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Shield, Plus } from 'lucide-react'

import Button from '@/components/ui/Button'
import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import Badge from '@/components/ui/Badge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import Dialog from '@/components/ui/Dialog'
import FormActions from '@/components/forms/FormActions'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useRoles } from '@/modules/organization/hooks/useRoles'
import type { Role } from '@/core/models/SystemRoleCode'
import { usePermissionList } from '@/modules/organization/hooks/usePermissionList'
import RoleForm from '@/modules/organization/forms/RoleForm'


export default function RolesPage() {
  const { t } = useTranslation('organization')
  const { items: roles, loading, create, update, archive } = useRoles()
  const { items: allPermissions } = usePermissionList()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<Role | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<Role | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return roles
    const q = search.toLowerCase()
    return roles.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        (item.nameAr ?? '').includes(search),
    )
  }, [roles, search])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const columns: DataTableColumn<Role>[] = [
    { key: 'code', header: t('role.code'), sortable: true, width: '140px' },
    { key: 'name', header: t('role.name'), sortable: true },
    { key: 'nameAr', header: t('role.nameAr') },
    { key: 'description', header: t('role.description') },
    {
      key: 'permissions',
      header: t('role.permissions'),
      render: (row) => (
        <Badge variant="primary" fill="soft">{(row.permissionIds as string[])?.length ?? 0}</Badge>
      ),
    },
    {
      key: 'isSystem',
      header: t('role.isSystem'),
      render: (row) => row.isSystem ? (
        <Badge variant="warning" fill="soft">{t('role.isSystem')}</Badge>
      ) : null,
    },
    {
      key: 'actions',
      header: '',
      width: '120px',
      render: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditItem(row); setFormOpen(true) }}>
            {t('role.edit')}
          </Button>
          {!row.isSystem && (
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setArchiveTarget(row) }}>
              {t('role.archive')}
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <RequirePermission permission="organization.role.view">
      <PageLayout
        title={t('role.title')}
        description={t('role.description')}
        icon={<Shield className="h-5 w-5" />}
        actions={
          <RequirePermission permission="organization.role.create">
            <Button onClick={() => { setEditItem(null); setFormOpen(true) }}>
              <Plus className="h-4 w-4 me-1" aria-hidden="true" />
              {t('role.create')}
            </Button>
          </RequirePermission>
        }
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('filters.searchRoles')}
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

        <RoleForm
          open={formOpen}
          onOpenChange={setFormOpen}
          role={editItem}
          allPermissions={allPermissions}
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
          title={t('role.archive')}
          footer={
            <FormActions
              submitLabel={t('role.archive')}
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
          <p className="text-sm text-content-muted">{t('role.confirmArchive')}</p>
        </Dialog>
      </PageLayout>
    </RequirePermission>
  )
}
