import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Layers, Plus } from 'lucide-react'

import Button from '@/components/ui/Button'
import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import Dialog from '@/components/ui/Dialog'
import FormActions from '@/components/forms/FormActions'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useDepartments } from '@/modules/organization/hooks/useDepartments'
import type { Department } from '@/core/models/DepartmentStatus'
import { useBranches } from '@/modules/organization/hooks/useBranches'
import { useUsers } from '@/modules/organization/hooks/useUsers'
import DepartmentForm from '@/modules/organization/forms/DepartmentForm'
import { DepartmentStatus } from '@/core/models/DepartmentStatus'

export default function DepartmentsPage() {
  const { t } = useTranslation('organization')
  const { items: departments, loading, create, update, archive } = useDepartments()
  const { items: branches } = useBranches()
  const { items: users } = useUsers()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<Department | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<Department | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return departments
    const q = search.toLowerCase()
    return departments.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        (item.nameAr ?? '').includes(search),
    )
  }, [departments, search])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const columns: DataTableColumn<Department>[] = [
    { key: 'code', header: t('department.code'), sortable: true, width: '100px' },
    { key: 'name', header: t('department.name'), sortable: true },
    { key: 'nameAr', header: t('department.nameAr') },
    {
      key: 'branchId',
      header: t('department.branch'),
      render: (row) => branches.find((b) => b._id === row.branchId)?.name ?? '-',
    },
    {
      key: 'managerId',
      header: t('department.manager'),
      render: (row) => users.find((u) => u._id === row.managerId)?.fullName ?? '-',
    },
    {
      key: 'status',
      header: t('department.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={row.status === DepartmentStatus.Active ? 'success' : 'neutral'}
          label={row.status === DepartmentStatus.Active ? t('department.active') : t('department.inactive')}
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
            {t('department.edit')}
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setArchiveTarget(row) }}>
            {t('department.archive')}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <RequirePermission permission="organization.department.view">
      <PageLayout
        title={t('department.title')}
        description={t('department.description')}
        icon={<Layers className="h-5 w-5" />}
        actions={
          <RequirePermission permission="organization.department.create">
            <Button onClick={() => { setEditItem(null); setFormOpen(true) }}>
              <Plus className="h-4 w-4 me-1" aria-hidden="true" />
              {t('department.create')}
            </Button>
          </RequirePermission>
        }
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('filters.searchDepartments')}
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

        <DepartmentForm
          open={formOpen}
          onOpenChange={setFormOpen}
          department={editItem}
          branches={branches}
          users={users}
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
          title={t('department.archive')}
          footer={
            <FormActions
              submitLabel={t('department.archive')}
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
          <p className="text-sm text-content-muted">{t('department.confirmArchive')}</p>
        </Dialog>
      </PageLayout>
    </RequirePermission>
  )
}
