import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Truck, Plus } from 'lucide-react'

import Button from '@/components/ui/Button'
import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import Dialog from '@/components/ui/Dialog'
import FormActions from '@/components/forms/FormActions'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useDeliveries } from '@/modules/sales/hooks/useDeliveries'

export default function Deliveries() {
  const { t } = useTranslation('sales')
  const { deliveries, loading, archive } = useDeliveries()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [archiveTarget, setArchiveTarget] = useState<typeof deliveries[0] | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return deliveries
    const q = search.toLowerCase()
    return deliveries.filter(
      (item) => item.code.toLowerCase().includes(q),
    )
  }, [deliveries, search])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statusTone = (status: string) => {
    switch (status) {
      case 'draft': return 'neutral' as const
      case 'packed': return 'info' as const
      case 'shipped': return 'warning' as const
      case 'delivered': return 'success' as const
      case 'cancelled': return 'danger' as const
      default: return 'neutral' as const
    }
  }

  const columns: DataTableColumn<typeof deliveries[0]>[] = [
    { key: 'code', header: t('delivery.code'), sortable: true, width: '140px' },
    { key: 'deliveryDate', header: t('delivery.deliveryDate'), sortable: true, render: (row) => new Date(row.deliveryDate).toLocaleDateString() },
    { key: 'salesOrderId', header: t('delivery.salesOrder'), render: (row) => <span className="text-sm text-content-muted">{row.salesOrderId ? 'Linked' : '-'}</span> },
    {
      key: 'trackingNumber',
      header: t('delivery.trackingNumber'),
      render: (row) => <span className="text-sm text-content-muted">{row.trackingNumber ?? '-'}</span>,
    },
    {
      key: 'status',
      header: t('delivery.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={statusTone(row.status)}
          label={t(`delivery.statuses.${row.status}`)}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '120px',
      render: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setArchiveTarget(row) }}>
            {t('customer.archive')}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <RequirePermission permission="sales.deliveries.view">
      <PageLayout
        title={t('delivery.title')}
        icon={<Truck className="h-5 w-5" />}
        actions={
          <RequirePermission permission="sales.deliveries.create">
            <Button>
              <Plus className="h-4 w-4 me-1" aria-hidden="true" />
              {t('delivery.create')}
            </Button>
          </RequirePermission>
        }
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('delivery.searchPlaceholder')}
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

        <Dialog
          open={!!archiveTarget}
          onOpenChange={(open) => { if (!open) setArchiveTarget(null) }}
          title={t('customer.archive')}
          footer={
            <FormActions
              submitLabel={t('customer.archive')}
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
          <p className="text-sm text-content-muted">{t('customer.confirmArchive')}</p>
        </Dialog>
      </PageLayout>
    </RequirePermission>
  )
}
