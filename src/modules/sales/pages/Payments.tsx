import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Banknote, Plus } from 'lucide-react'

import Button from '@/components/ui/Button'
import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import Dialog from '@/components/ui/Dialog'
import FormActions from '@/components/forms/FormActions'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useCustomerPayments } from '@/modules/sales/hooks/useCustomerPayments'
import { formatMoney } from '@/core/utils/currency'

export default function Payments() {
  const { t } = useTranslation('sales')
  const { payments, loading, archive } = useCustomerPayments()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [archiveTarget, setArchiveTarget] = useState<typeof payments[0] | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return payments
    const q = search.toLowerCase()
    return payments.filter(
      (item) => item.code.toLowerCase().includes(q),
    )
  }, [payments, search])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statusTone = (status: string) => {
    switch (status) {
      case 'draft': return 'neutral' as const
      case 'completed': return 'success' as const
      case 'cancelled': return 'danger' as const
      default: return 'neutral' as const
    }
  }

  const columns: DataTableColumn<typeof payments[0]>[] = [
    { key: 'code', header: t('customerPayment.code'), sortable: true, width: '150px' },
    { key: 'paymentDate', header: t('customerPayment.paymentDate'), sortable: true, render: (row) => new Date(row.paymentDate).toLocaleDateString() },
    {
      key: 'amount',
      header: t('customerPayment.amount'),
      sortable: true,
      render: (row) => <span className="font-medium">{formatMoney(row.amount)}</span>,
    },
    {
      key: 'paymentMethod',
      header: t('customerPayment.paymentMethod'),
      render: (row) => (
        <span className="text-sm text-content-muted">
          {t(`customerPayment.methods.${row.paymentMethod}`)}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('customerPayment.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={statusTone(row.status)}
          label={t(`customerPayment.statuses.${row.status}`)}
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
    <RequirePermission permission="sales.payments.view">
      <PageLayout
        title={t('customerPayment.title')}
        icon={<Banknote className="h-5 w-5" />}
        actions={
          <RequirePermission permission="sales.payments.create">
            <Button>
              <Plus className="h-4 w-4 me-1" aria-hidden="true" />
              {t('customerPayment.create')}
            </Button>
          </RequirePermission>
        }
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('customerPayment.searchPlaceholder')}
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
