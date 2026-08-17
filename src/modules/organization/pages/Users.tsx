import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Users, Plus } from 'lucide-react'

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
import { useUsers } from '@/modules/organization/hooks/useUsers'
import type { User } from '@/core/models/UserStatus'
import { useRoles } from '@/modules/organization/hooks/useRoles'
import { useOrganizations } from '@/modules/organization/hooks/useOrganizations'
import { useBranches } from '@/modules/organization/hooks/useBranches'
import { useDepartments } from '@/modules/organization/hooks/useDepartments'
import UserForm from '@/modules/organization/forms/UserForm'
import { UserStatus } from '@/core/models/UserStatus'

export default function UsersPage() {
  const { t } = useTranslation('organization')
  const { items: users, loading, create, update, archive } = useUsers()
  const { items: roles } = useRoles()
  const { items: organizations } = useOrganizations()
  const { items: branches } = useBranches()
  const { items: departments } = useDepartments()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<User | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<User | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return users
    const q = search.toLowerCase()
    return users.filter(
      (item) =>
        item.username.toLowerCase().includes(q) ||
        item.fullName.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        (item.fullNameAr ?? '').includes(search),
    )
  }, [users, search])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statusTone = (status: string) => {
    switch (status) {
      case UserStatus.Active: return 'success' as const
      case UserStatus.Inactive: return 'neutral' as const
      case UserStatus.Suspended: return 'danger' as const
      default: return 'neutral' as const
    }
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case UserStatus.Active: return t('user.active')
      case UserStatus.Inactive: return t('user.inactive')
      case UserStatus.Suspended: return t('user.suspended')
      default: return status
    }
  }

  const columns: DataTableColumn<User>[] = [
    { key: 'username', header: t('user.username'), sortable: true },
    { key: 'fullName', header: t('user.fullName'), sortable: true },
    { key: 'email', header: t('user.email'), sortable: true },
    {
      key: 'roleId',
      header: t('user.role'),
      render: (row) => roles.find((r) => r._id === row.roleId)?.name ?? '-',
    },
    {
      key: 'status',
      header: t('user.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge tone={statusTone(row.status)} label={statusLabel(row.status)} />
      ),
    },
    {
      key: 'lastLoginAt',
      header: t('user.lastLoginAt'),
      render: (row) => row.lastLoginAt ? formatDate(row.lastLoginAt as unknown as Date) : '-',
    },
    {
      key: 'actions',
      header: '',
      width: '120px',
      render: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditItem(row); setFormOpen(true) }}>
            {t('user.edit')}
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setArchiveTarget(row) }}>
            {t('user.archive')}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <RequirePermission permission="organization.user.view">
      <PageLayout
        title={t('user.title')}
        description={t('user.description')}
        icon={<Users className="h-5 w-5" />}
        actions={
          <RequirePermission permission="organization.user.create">
            <Button onClick={() => { setEditItem(null); setFormOpen(true) }}>
              <Plus className="h-4 w-4 me-1" aria-hidden="true" />
              {t('user.create')}
            </Button>
          </RequirePermission>
        }
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('filters.searchUsers')}
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

        <UserForm
          open={formOpen}
          onOpenChange={setFormOpen}
          user={editItem}
          roles={roles}
          organizations={organizations}
          branches={branches}
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
          title={t('user.archive')}
          footer={
            <FormActions
              submitLabel={t('user.archive')}
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
          <p className="text-sm text-content-muted">{t('user.confirmArchive')}</p>
        </Dialog>
      </PageLayout>
    </RequirePermission>
  )
}
