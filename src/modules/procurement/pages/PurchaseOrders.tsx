import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, Plus } from 'lucide-react'

import Button from '@/components/ui/Button'
import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import Dialog from '@/components/ui/Dialog'
import FormActions from '@/components/forms/FormActions'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { usePurchaseOrders } from '@/modules/procurement/hooks/usePurchaseOrders'
import { useSuppliers } from '@/modules/procurement/hooks/useSuppliers'
import { PurchaseOrderForm } from '@/modules/procurement/forms/PurchaseOrderForm'
import { formatMoney } from '@/core/utils/currency'

export default function PurchaseOrders() {
  const { t } = useTranslation('procurement')
  const { orders, loading, create, submit, confirm, cancel } = usePurchaseOrders()
  const { suppliers } = useSuppliers()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formOpen, setFormOpen] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<typeof orders[0] | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return orders
    const q = search.toLowerCase()
    return orders.filter(
      (item) =>
        item.code.toLowerCase().includes(q) ||
        item.supplierId.toLowerCase().includes(q),
    )
  }, [orders, search])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statusTone = (status: string) => {
    switch (status) {
      case 'draft': return 'neutral' as const
      case 'submitted': return 'info' as const
      case 'confirmed': return 'success' as const
      case 'partially_received': return 'warning' as const
      case 'received': return 'success' as const
      case 'cancelled': return 'neutral' as const
      default: return 'neutral' as const
    }
  }

  const columns: DataTableColumn<typeof orders[0]>[] = [
    { key: 'code', header: t('purchaseOrder.code'), sortable: true, width: '120px' },
    {
      key: 'orderDate',
      header: t('purchaseOrder.orderDate'),
      sortable: true,
      render: (row) => (
        <span className="text-sm text-content-muted">
          {new Date(row.orderDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'supplierId',
      header: t('purchaseOrder.supplier'),
      sortable: true,
      render: (row) => {
        const supplier = suppliers.find((s) => s._id === row.supplierId)
        return <span className="text-sm">{supplier?.name ?? row.supplierId}</span>
      },
    },
    {
      key: 'totalAmount',
      header: t('purchaseOrder.totalAmount'),
      sortable: true,
      render: (row) => (
        <span className="text-sm font-mono">{formatMoney(row.totalAmount)}</span>
      ),
    },
    {
      key: 'expectedDeliveryDate',
      header: t('purchaseOrder.expectedDeliveryDate'),
      sortable: true,
      render: (row) => (
        <span className="text-sm text-content-muted">
          {row.expectedDeliveryDate ? new Date(row.expectedDeliveryDate).toLocaleDateString() : '-'}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('purchaseOrder.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={statusTone(row.status)}
          label={t(`purchaseOrder.statusValues.${row.status}`)}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '200px',
      render: (row) => (
        <div className="flex gap-1">
          {row.status === 'draft' && (
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); submit(row._id) }}>
              {t('purchaseOrder.submit')}
            </Button>
          )}
          {row.status === 'submitted' && (
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); confirm(row._id) }}>
              {t('purchaseOrder.confirm')}
            </Button>
          )}
          {row.status !== 'cancelled' && row.status !== 'received' && (
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setCancelTarget(row) }}>
              {t('purchaseOrder.cancel')}
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <RequirePermission permission="procurement.orders.view">
      <PageLayout
        title={t('purchaseOrder.title')}
        description={t('purchaseOrder.description')}
        icon={<ShoppingCart className="h-5 w-5" />}
        actions={
          <RequirePermission permission="procurement.orders.create">
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 me-1" aria-hidden="true" />
              {t('purchaseOrder.create')}
            </Button>
          </RequirePermission>
        }
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('purchaseOrder.searchPlaceholder')}
          />
        </div>

        <DataTable
          columns={columns}
          data={paginated}
          rowKey={(row) => row._id}
          loading={loading}
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

        <PurchaseOrderForm
          open={formOpen}
          onOpenChange={setFormOpen}
          suppliers={suppliers.map((s) => ({ _id: s._id, name: s.name }))}
          onSubmit={(input) => { create(input); setFormOpen(false) }}
        />

        <Dialog
          open={!!cancelTarget}
          onOpenChange={(open) => { if (!open) setCancelTarget(null) }}
          title={t('purchaseOrder.cancel')}
          footer={
            <FormActions
              submitLabel={t('purchaseOrder.cancel')}
              onCancel={() => setCancelTarget(null)}
              onSubmit={() => {
                if (cancelTarget) {
                  cancel(cancelTarget._id)
                  setCancelTarget(null)
                }
              }}
            />
          }
        >
          <p className="text-sm text-content-muted">{t('purchaseOrder.confirmCancel')}</p>
        </Dialog>
      </PageLayout>
    </RequirePermission>
  )
}
