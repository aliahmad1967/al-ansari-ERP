import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Package, Plus } from 'lucide-react'

import Button from '@/components/ui/Button'
import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import Dialog from '@/components/ui/Dialog'
import FormActions from '@/components/forms/FormActions'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useProducts } from '@/modules/inventory/hooks/useProducts'
import { ProductForm } from '@/modules/inventory/forms/ProductForm'

export default function Products() {
  const { t } = useTranslation('inventory')
  const { products, loading, create, update, archive } = useProducts()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<typeof products[0] | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<typeof products[0] | null>(null)

  const formatMoney = (value: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)

  const filtered = useMemo(() => {
    if (!search.trim()) return products
    const q = search.toLowerCase()
    return products.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.nameAr ?? '').includes(search) ||
        item.sku.toLowerCase().includes(q) ||
        (item.barcode ?? '').includes(search),
    )
  }, [products, search])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statusTone = (status: string) => {
    switch (status) {
      case 'active': return 'success' as const
      case 'inactive': return 'neutral' as const
      case 'discontinued': return 'warning' as const
      default: return 'neutral' as const
    }
  }

  const columns: DataTableColumn<typeof products[0]>[] = [
    { key: 'sku', header: t('product.sku'), sortable: true, width: '120px' },
    {
      key: 'name',
      header: t('product.name'),
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-content">{row.name}</p>
          {row.nameAr && <p className="text-sm text-content-muted">{row.nameAr}</p>}
        </div>
      ),
    },
    { key: 'categoryId', header: t('product.category'), sortable: true, width: '120px' },
    {
      key: 'purchasePrice',
      header: t('product.purchasePrice'),
      sortable: true,
      render: (row) => <span className="text-sm font-mono">{formatMoney(row.purchasePrice)}</span>,
    },
    {
      key: 'sellingPrice',
      header: t('product.sellingPrice'),
      sortable: true,
      render: (row) => <span className="text-sm font-mono">{formatMoney(row.sellingPrice)}</span>,
    },
    { key: 'minimumStock', header: t('product.minimumStock'), sortable: true },
    {
      key: 'status',
      header: t('product.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={statusTone(row.status)}
          label={t(`product.statusValues.${row.status}`)}
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
            {t('product.edit')}
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setArchiveTarget(row) }}>
            {t('product.archive')}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <RequirePermission permission="inventory.products.view">
      <PageLayout
        title={t('product.title')}
        description={t('product.description')}
        icon={<Package className="h-5 w-5" />}
        actions={
          <RequirePermission permission="inventory.products.create">
            <Button onClick={() => { setEditItem(null); setFormOpen(true) }}>
              <Plus className="h-4 w-4 me-1" aria-hidden="true" />
              {t('product.create')}
            </Button>
          </RequirePermission>
        }
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('product.searchPlaceholder')}
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

        <ProductForm
          open={formOpen}
          onOpenChange={setFormOpen}
          product={editItem}
          categories={[]}
          units={[]}
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
          title={t('product.archive')}
          footer={
            <FormActions
              submitLabel={t('product.archive')}
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
          <p className="text-sm text-content-muted">{t('product.confirmArchive')}</p>
        </Dialog>
      </PageLayout>
    </RequirePermission>
  )
}
