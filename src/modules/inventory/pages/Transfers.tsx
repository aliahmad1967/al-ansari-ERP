import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Truck, Plus, CheckCircle, X } from 'lucide-react'

import Button from '@/components/ui/Button'
import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import Dialog from '@/components/ui/Dialog'
import FormActions from '@/components/forms/FormActions'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useStockTransfers } from '@/modules/inventory/hooks/useStockTransfers'
import { useWarehouses } from '@/modules/inventory/hooks/useWarehouses'
import { StockTransferForm } from '@/modules/inventory/forms/StockTransferForm'

export default function Transfers() {
  const { t } = useTranslation('inventory')
  const { transfers, loading, create, updateStatus, cancel } = useStockTransfers()
  const { warehouses } = useWarehouses()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formOpen, setFormOpen] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<typeof transfers[0] | null>(null)

  const warehouseMap = useMemo(() => {
    const map = new Map<string, typeof warehouses[0]>()
    for (const w of warehouses) map.set(w._id, w)
    return map
  }, [warehouses])

  const filtered = useMemo(() => {
    if (!search.trim()) return transfers
    const q = search.toLowerCase()
    return transfers.filter((item) => {
      const fromWh = warehouseMap.get(item.fromWarehouseId)
      const toWh = warehouseMap.get(item.toWarehouseId)
      return (
        item.code.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q) ||
        (fromWh?.name ?? '').toLowerCase().includes(q) ||
        (fromWh?.code ?? '').toLowerCase().includes(q) ||
        (toWh?.name ?? '').toLowerCase().includes(q) ||
        (toWh?.code ?? '').toLowerCase().includes(q)
      )
    })
  }, [transfers, search, warehouseMap])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statusTone = (status: string) => {
    switch (status) {
      case 'draft': return 'neutral' as const
      case 'pending': return 'warning' as const
      case 'in_transit': return 'info' as const
      case 'received': return 'success' as const
      case 'cancelled': return 'neutral' as const
      default: return 'neutral' as const
    }
  }

  const columns: DataTableColumn<typeof transfers[0]>[] = [
    { key: 'code', header: t('stockTransfer.code'), sortable: true, width: '120px' },
    {
      key: 'fromWarehouseId',
      header: t('stockTransfer.fromWarehouse'),
      render: (row) => {
        const wh = warehouseMap.get(row.fromWarehouseId)
        return <span className="text-sm">{wh?.name ?? row.fromWarehouseId}</span>
      },
    },
    {
      key: 'toWarehouseId',
      header: t('stockTransfer.toWarehouse'),
      render: (row) => {
        const wh = warehouseMap.get(row.toWarehouseId)
        return <span className="text-sm">{wh?.name ?? row.toWarehouseId}</span>
      },
    },
    {
      key: 'status',
      header: t('stockTransfer.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={statusTone(row.status)}
          label={t(`stockTransfer.statusValues.${row.status}`)}
        />
      ),
    },
    {
      key: 'expectedArrivalDate',
      header: t('stockTransfer.expectedArrivalDate'),
      render: (row) => (
        <span className="text-sm text-content-muted">
          {row.expectedArrivalDate ? new Date(row.expectedArrivalDate).toLocaleDateString() : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '180px',
      render: (row) => (
        <div className="flex gap-1">
          {row.status === 'in_transit' && (
            <RequirePermission permission="inventory.transfers.create">
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); updateStatus(row._id, 'received') }}>
                <CheckCircle className="h-3 w-3 me-1" />{t('stockTransfer.receive')}
              </Button>
            </RequirePermission>
          )}
          {(row.status === 'draft' || row.status === 'pending') && (
            <RequirePermission permission="inventory.transfers.create">
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setCancelTarget(row) }}>
                <X className="h-3 w-3 me-1" />{t('stockTransfer.cancel')}
              </Button>
            </RequirePermission>
          )}
        </div>
      ),
    },
  ]

  return (
    <RequirePermission permission="inventory.transfers.view">
      <PageLayout
        title={t('stockTransfer.title')}
        description={t('stockTransfer.description')}
        icon={<Truck className="h-5 w-5" />}
        actions={
          <RequirePermission permission="inventory.transfers.create">
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 me-1" aria-hidden="true" />
              {t('stockTransfer.create')}
            </Button>
          </RequirePermission>
        }
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('stockTransfer.searchPlaceholder')}
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

        <StockTransferForm
          open={formOpen}
          onOpenChange={setFormOpen}
          warehouses={warehouses.map((w) => ({ _id: w._id, name: w.name }))}
          onSubmit={(input) => { create(input) }}
        />

        <Dialog
          open={!!cancelTarget}
          onOpenChange={(open) => { if (!open) setCancelTarget(null) }}
          title={t('stockTransfer.cancelConfirm')}
          footer={
            <FormActions
              submitLabel={t('stockTransfer.cancel')}
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
          <p className="text-sm text-content-muted">{t('stockTransfer.confirmCancel')}</p>
        </Dialog>
      </PageLayout>
    </RequirePermission>
  )
}
