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
import { useSuppliers } from '@/modules/procurement/hooks/useSuppliers'
import { SupplierForm } from '@/modules/procurement/forms/SupplierForm'

export default function Suppliers() {
  const { t } = useTranslation('procurement')
  const { suppliers, loading, create, update, archive } = useSuppliers()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<typeof suppliers[0] | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<typeof suppliers[0] | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return suppliers
    const q = search.toLowerCase()
    return suppliers.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        (item.contactPerson ?? '').toLowerCase().includes(q),
    )
  }, [suppliers, search])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statusTone = (status: string) => {
    switch (status) {
      case 'active': return 'success' as const
      case 'inactive': return 'neutral' as const
      case 'blacklisted': return 'warning' as const
      default: return 'neutral' as const
    }
  }

  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'text-yellow-500' : 'text-gray-300'}>
          ★
        </span>,
      )
    }
    return <div className="flex gap-0.5">{stars}</div>
  }

  const columns: DataTableColumn<typeof suppliers[0]>[] = [
    { key: 'code', header: t('supplier.code'), sortable: true, width: '120px' },
    {
      key: 'name',
      header: t('supplier.name'),
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-content">{row.name}</p>
          {row.nameAr && <p className="text-sm text-content-muted">{row.nameAr}</p>}
        </div>
      ),
    },
    {
      key: 'contactPerson',
      header: t('supplier.contactPerson'),
      render: (row) => (
        <span className="text-sm text-content-muted">{row.contactPerson ?? '-'}</span>
      ),
    },
    {
      key: 'phone',
      header: t('supplier.phone'),
      render: (row) => (
        <span className="text-sm text-content-muted">{row.phone ?? '-'}</span>
      ),
    },
    {
      key: 'email',
      header: t('supplier.email'),
      render: (row) => (
        <span className="text-sm text-content-muted">{row.email ?? '-'}</span>
      ),
    },
    {
      key: 'rating',
      header: t('supplier.rating'),
      sortable: true,
      render: (row) => renderStars(row.rating),
    },
    {
      key: 'status',
      header: t('supplier.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={statusTone(row.status)}
          label={t(`supplier.statusValues.${row.status}`)}
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
            {t('supplier.edit')}
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setArchiveTarget(row) }}>
            {t('supplier.archive')}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <RequirePermission permission="procurement.suppliers.view">
      <PageLayout
        title={t('supplier.title')}
        description={t('supplier.description')}
        icon={<Building2 className="h-5 w-5" />}
        actions={
          <RequirePermission permission="procurement.suppliers.create">
            <Button onClick={() => { setEditItem(null); setFormOpen(true) }}>
              <Plus className="h-4 w-4 me-1" aria-hidden="true" />
              {t('supplier.create')}
            </Button>
          </RequirePermission>
        }
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('supplier.searchPlaceholder')}
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

        <SupplierForm
          open={formOpen}
          onOpenChange={setFormOpen}
          supplier={editItem}
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
          title={t('supplier.archive')}
          footer={
            <FormActions
              submitLabel={t('supplier.archive')}
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
          <p className="text-sm text-content-muted">{t('supplier.confirmArchive')}</p>
        </Dialog>
      </PageLayout>
    </RequirePermission>
  )
}
