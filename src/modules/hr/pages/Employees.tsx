import { useState, useMemo } from 'react'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
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
import { useEmployees } from '@/modules/hr/hooks/useEmployees'
import { EmployeeStatus } from '@/core/models/EmployeeStatus'
import EmployeeForm from '@/modules/hr/forms/EmployeeForm'

export default function EmployeesPage() {
  const { t } = useTranslation('hr')
  const { items: employees, loading, create, update, archive } = useEmployees()

  const { search, setSearch, debouncedSearch, page, setPage } = useDebouncedSearch()
  const [pageSize, setPageSize] = useState(10)
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<typeof employees[0] | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<typeof employees[0] | null>(null)

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return employees
    const q = debouncedSearch.toLowerCase()
    return employees.filter(
      (item) =>
        item.firstName.toLowerCase().includes(q) ||
        item.lastName.toLowerCase().includes(q) ||
        item.employeeNumber.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        (item.firstNameAr ?? '').includes(debouncedSearch) ||
        (item.lastNameAr ?? '').includes(debouncedSearch),
    )
  }, [employees, debouncedSearch])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const columns: DataTableColumn<typeof employees[0]>[] = [
    { key: 'employeeNumber', header: t('employee.number'), sortable: true, width: '120px' },
    {
      key: 'firstName',
      header: t('employee.name'),
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-content">{row.firstName} {row.lastName}</p>
          {(row.firstNameAr || row.lastNameAr) && (
            <p className="text-sm text-content-muted">{row.firstNameAr} {row.lastNameAr}</p>
          )}
        </div>
      ),
    },
    { key: 'email', header: t('employee.email'), sortable: true },
    { key: 'phone', header: t('employee.phone') },
    {
      key: 'status',
      header: t('employee.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={row.status === EmployeeStatus.Active ? 'success' : row.status === EmployeeStatus.Suspended ? 'warning' : 'neutral'}
          label={t(`employee.${row.status}`)}
        />
      ),
    },
    {
      key: 'employmentDate',
      header: t('employee.employmentDate'),
      sortable: true,
      render: (row) => new Date(row.employmentDate).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: '',
      width: '120px',
      render: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditItem(row); setFormOpen(true) }}>
            {t('employee.edit')}
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setArchiveTarget(row) }}>
            {t('employee.archive')}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <RequirePermission permission="hr.employee.view">
      <PageLayout
        title={t('employee.title')}
        description={t('employee.description')}
        icon={<Users className="h-5 w-5" />}
        actions={
          <RequirePermission permission="hr.employee.create">
            <Button onClick={() => { setEditItem(null); setFormOpen(true) }}>
              <Plus className="h-4 w-4 me-1" aria-hidden="true" />
              {t('employee.create')}
            </Button>
          </RequirePermission>
        }
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('filters.searchEmployees')}
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

        <EmployeeForm
          open={formOpen}
          onOpenChange={setFormOpen}
          employee={editItem}
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
          title={t('employee.archive')}
          footer={
            <FormActions
              submitLabel={t('employee.archive')}
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
          <p className="text-sm text-content-muted">{t('employee.confirmArchive')}</p>
        </Dialog>
      </PageLayout>
    </RequirePermission>
  )
}
