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
import { useGoodsReceipts } from '@/modules/procurement/hooks/useGoodsReceipts'
import { GoodsReceiptForm } from '@/modules/procurement/forms/GoodsReceiptForm'

export default function GoodsReceipts() {
  const { t } = useTranslation('procurement')
  const { receipts, loading, create, markReceived, markAccepted, markRejected } = useGoodsReceipts()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formOpen, setFormOpen] = useState(false)
  const [rejectTarget, setRejectTarget] = useState<typeof receipts[0] | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return receipts
    const q = search.toLowerCase()
    return receipts.filter(
      (item) =>
        item.code.toLowerCase().includes(q) ||
        item.purchaseOrderId.toLowerCase().includes(q) ||
        item.supplierId.toLowerCase().includes(q) ||
        item.warehouseId.toLowerCase().includes(q),
    )
  }, [receipts, search])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statusTone = (status: string) => {
    switch (status) {
      case 'draft': return 'neutral' as const
      case 'received': return 'info' as const
      case 'inspected': return 'warning' as const
      case 'accepted': return 'success' as const
      case 'rejected': return 'warning' as const
      default: return 'neutral' as const
    }
  }

  const columns: DataTableColumn<typeof receipts[0]>[] = [
    { key: 'code', header: t('goodsReceipt.code'), sortable: true, width: '120px' },
    {
      key: 'receiptDate',
      header: t('goodsReceipt.receiptDate'),
      sortable: true,
      render: (row) => (
        <span className="text-sm text-content-muted">
          {new Date(row.receiptDate).toLocaleDateString()}
        </span>
      ),
    },
    { key: 'purchaseOrderId', header: t('goodsReceipt.purchaseOrder'), sortable: true },
    { key: 'supplierId', header: t('goodsReceipt.supplier'), sortable: true },
    { key: 'warehouseId', header: t('goodsReceipt.warehouse'), sortable: true },
    {
      key: 'status',
      header: t('goodsReceipt.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={statusTone(row.status)}
          label={t(`goodsReceipt.statusValues.${row.status}`)}
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
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); markReceived(row._id) }}>
              {t('goodsReceipt.markReceived')}
            </Button>
          )}
          {row.status === 'received' && (
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); markAccepted(row._id) }}>
              {t('goodsReceipt.markAccepted')}
            </Button>
          )}
          {(row.status === 'draft' || row.status === 'received') && (
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setRejectTarget(row) }}>
              {t('goodsReceipt.markRejected')}
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <RequirePermission permission="procurement.receipts.view">
      <PageLayout
        title={t('goodsReceipt.title')}
        description={t('goodsReceipt.description')}
        icon={<Package className="h-5 w-5" />}
        actions={
          <RequirePermission permission="procurement.receipts.create">
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 me-1" aria-hidden="true" />
              {t('goodsReceipt.create')}
            </Button>
          </RequirePermission>
        }
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('goodsReceipt.searchPlaceholder')}
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

        <GoodsReceiptForm
          open={formOpen}
          onOpenChange={setFormOpen}
          warehouses={[]}
          onSubmit={(input) => { create(input); setFormOpen(false) }}
        />

        <Dialog
          open={!!rejectTarget}
          onOpenChange={(open) => { if (!open) setRejectTarget(null) }}
          title={t('goodsReceipt.markRejected')}
          footer={
            <FormActions
              submitLabel={t('goodsReceipt.markRejected')}
              onCancel={() => setRejectTarget(null)}
              onSubmit={() => {
                if (rejectTarget) {
                  markRejected(rejectTarget._id)
                  setRejectTarget(null)
                }
              }}
            />
          }
        >
          <p className="text-sm text-content-muted">{t('goodsReceipt.confirmReject')}</p>
        </Dialog>
      </PageLayout>
    </RequirePermission>
  )
}
