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
import { useSalaryStructures } from '@/modules/hr/hooks/useSalaryStructures'
import SalaryStructureForm from '@/modules/hr/forms/SalaryStructureForm'

export default function SalaryStructures() {
  const { t } = useTranslation('hr')
  const { items: structures, loading, create, update, archive } = useSalaryStructures()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<typeof structures[0] | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<typeof structures[0] | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return structures
    const q = search.toLowerCase()
    return structures.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        (item.nameAr ?? '').includes(search),
    )
  }, [structures, search])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const columns: DataTableColumn<typeof structures[0]>[] = [
    { key: 'code', header: t('salaryStructure.code'), sortable: true, width: '120px' },
    {
      key: 'name',
      header: t('salaryStructure.name'),
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-content">{row.name}</p>
          {row.nameAr && <p className="text-sm text-content-muted">{row.nameAr}</p>}
        </div>
      ),
    },
    {
      key: 'isActive',
      header: t('salaryStructure.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={row.isActive ? 'success' : 'neutral'}
          label={row.isActive ? t('salaryStructure.active') : t('salaryStructure.inactive')}
        />
      ),
    },
    {
      key: 'description',
      header: t('salaryStructure.description'),
      render: (row) => (
        <span className="text-sm text-content-muted truncate max-w-[200px] block">
          {row.description ?? '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '120px',
      render: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditItem(row); setFormOpen(true) }}>
            {t('salaryStructure.edit')}
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setArchiveTarget(row) }}>
            {t('salaryStructure.archive')}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <RequirePermission permission="hr.payroll.view">
      <PageLayout
        title={t('salaryStructure.title')}
        description={t('salaryStructure.description')}
        icon={<Layers className="h-5 w-5" />}
        actions={
          <RequirePermission permission="hr.payroll.create">
            <Button onClick={() => { setEditItem(null); setFormOpen(true) }}>
              <Plus className="h-4 w-4 me-1" aria-hidden="true" />
              {t('salaryStructure.create')}
            </Button>
          </RequirePermission>
        }
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('salaryStructure.searchPlaceholder')}
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

        <SalaryStructureForm
          open={formOpen}
          onOpenChange={setFormOpen}
          structure={editItem}
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
          title={t('salaryStructure.archive')}
          footer={
            <FormActions
              submitLabel={t('salaryStructure.archive')}
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
          <p className="text-sm text-content-muted">{t('salaryStructure.confirmArchive')}</p>
        </Dialog>
      </PageLayout>
    </RequirePermission>
  )
}
