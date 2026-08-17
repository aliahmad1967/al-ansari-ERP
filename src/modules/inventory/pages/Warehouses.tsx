import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Warehouse, Plus } from 'lucide-react'

import Button from '@/components/ui/Button'
import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import Dialog from '@/components/ui/Dialog'
import FormActions from '@/components/forms/FormActions'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useWarehouses } from '@/modules/inventory/hooks/useWarehouses'
import { WarehouseForm } from '@/modules/inventory/forms/WarehouseForm'

export default function Warehouses() {
  const { t } = useTranslation('inventory')
  const { warehouses, loading, create, update, archive } = useWarehouses()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<typeof warehouses[0] | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<typeof warehouses[0] | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return warehouses
    const q = search.toLowerCase()
    return warehouses.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.nameAr ?? '').includes(search) ||
        item.code.toLowerCase().includes(q),
    )
  }, [warehouses, search])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statusTone = (status: string) => {
    switch (status) {
      case 'active': return 'success' as const
      case 'inactive': return 'neutral' as const
      default: return 'neutral' as const
    }
  }

  const columns: DataTableColumn<typeof warehouses[0]>[] = [
    { key: 'code', header: t('warehouse.code'), sortable: true, width: '120px' },
    {
      key: 'name',
      header: t('warehouse.name'),
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-content">{row.name}</p>
          {row.nameAr && <p className="text-sm text-content-muted">{row.nameAr}</p>}
        </div>
      ),
    },
    {
      key: 'address',
      header: t('warehouse.address'),
      render: (row) => (
        <span className="text-sm text-content-muted truncate max-w-[200px] block">
          {row.address ?? '-'}
        </span>
      ),
    },
    { key: 'capacity', header: t('warehouse.capacity'), sortable: true },
    {
      key: 'status',
      header: t('warehouse.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={statusTone(row.status)}
          label={t(`warehouse.statusValues.${row.status}`)}
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
            {t('warehouse.edit')}
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setArchiveTarget(row) }}>
            {t('warehouse.archive')}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <RequirePermission permission="inventory.warehouses.view">
      <PageLayout
        title={t('warehouse.title')}
        description={t('warehouse.description')}
        icon={<Warehouse className="h-5 w-5" />}
        actions={
          <RequirePermission permission="inventory.warehouses.create">
            <Button onClick={() => { setEditItem(null); setFormOpen(true) }}>
              <Plus className="h-4 w-4 me-1" aria-hidden="true" />
              {t('warehouse.create')}
            </Button>
          </RequirePermission>
        }
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('warehouse.searchPlaceholder')}
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

        <WarehouseForm
          open={formOpen}
          onOpenChange={setFormOpen}
          warehouse={editItem}
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
          title={t('warehouse.archive')}
          footer={
            <FormActions
              submitLabel={t('warehouse.archive')}
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
          <p className="text-sm text-content-muted">{t('warehouse.confirmArchive')}</p>
        </Dialog>
      </PageLayout>
    </RequirePermission>
  )
}
