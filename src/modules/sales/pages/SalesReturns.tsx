import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { RotateCcw, Plus } from 'lucide-react'

import Button from '@/components/ui/Button'
import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import Dialog from '@/components/ui/Dialog'
import FormActions from '@/components/forms/FormActions'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useSalesReturns } from '@/modules/sales/hooks/useSalesReturns'
import { formatMoney } from '@/core/utils/currency'

export default function SalesReturns() {
  const { t } = useTranslation('sales')
  const { salesReturns, loading, archive } = useSalesReturns()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [archiveTarget, setArchiveTarget] = useState<typeof salesReturns[0] | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return salesReturns
    const q = search.toLowerCase()
    return salesReturns.filter(
      (item) => item.code.toLowerCase().includes(q),
    )
  }, [salesReturns, search])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statusTone = (status: string) => {
    switch (status) {
      case 'draft': return 'neutral' as const
      case 'received': return 'info' as const
      case 'approved': return 'success' as const
      case 'completed': return 'success' as const
      case 'rejected': return 'danger' as const
      case 'cancelled': return 'danger' as const
      default: return 'neutral' as const
    }
  }

  const columns: DataTableColumn<typeof salesReturns[0]>[] = [
    { key: 'code', header: t('salesReturn.code'), sortable: true, width: '140px' },
    { key: 'returnDate', header: t('salesReturn.returnDate'), sortable: true, render: (row) => new Date(row.returnDate).toLocaleDateString() },
    {
      key: 'reason',
      header: t('salesReturn.reason'),
      render: (row) => <span className="text-sm text-content-muted">{row.reason}</span>,
    },
    {
      key: 'netAmount',
      header: t('salesReturn.netAmount'),
      sortable: true,
      render: (row) => <span className="font-medium">{formatMoney(row.netAmount, row.currency)}</span>,
    },
    {
      key: 'status',
      header: t('salesReturn.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={statusTone(row.status)}
          label={t(`salesReturn.statuses.${row.status}`)}
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
    <RequirePermission permission="sales.returns.view">
      <PageLayout
        title={t('salesReturn.title')}
        icon={<RotateCcw className="h-5 w-5" />}
        actions={
          <RequirePermission permission="sales.returns.create">
            <Button>
              <Plus className="h-4 w-4 me-1" aria-hidden="true" />
              {t('salesReturn.create')}
            </Button>
          </RequirePermission>
        }
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('salesReturn.searchPlaceholder')}
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
