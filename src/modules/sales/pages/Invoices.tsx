import { useState, useMemo } from 'react'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { useTranslation } from 'react-i18next'
import { FileCheck, Plus } from 'lucide-react'

import Button from '@/components/ui/Button'
import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import Dialog from '@/components/ui/Dialog'
import FormActions from '@/components/forms/FormActions'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useSalesInvoices } from '@/modules/sales/hooks/useSalesInvoices'
import { formatMoney } from '@/core/utils/currency'

export default function Invoices() {
  const { t } = useTranslation('sales')
  const { invoices, loading, archive } = useSalesInvoices()

  const { search, setSearch, debouncedSearch, page, setPage } = useDebouncedSearch()
  const [pageSize, setPageSize] = useState(10)
  const [archiveTarget, setArchiveTarget] = useState<typeof invoices[0] | null>(null)

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return invoices
    const q = debouncedSearch.toLowerCase()
    return invoices.filter(
      (item) => item.code.toLowerCase().includes(q),
    )
  }, [invoices, debouncedSearch])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statusTone = (status: string) => {
    switch (status) {
      case 'draft': return 'neutral' as const
      case 'finalized': return 'info' as const
      case 'sent': return 'primary' as const
      case 'partially_paid': return 'warning' as const
      case 'paid': return 'success' as const
      case 'overdue': return 'danger' as const
      case 'cancelled': return 'danger' as const
      default: return 'neutral' as const
    }
  }

  const columns: DataTableColumn<typeof invoices[0]>[] = [
    { key: 'code', header: t('salesInvoice.code'), sortable: true, width: '150px' },
    { key: 'invoiceDate', header: t('salesInvoice.invoiceDate'), sortable: true, render: (row) => new Date(row.invoiceDate).toLocaleDateString() },
    { key: 'dueDate', header: t('salesInvoice.dueDate'), render: (row) => new Date(row.dueDate).toLocaleDateString() },
    {
      key: 'netAmount',
      header: t('salesInvoice.netAmount'),
      sortable: true,
      render: (row) => <span className="font-medium">{formatMoney(row.netAmount, row.currency)}</span>,
    },
    {
      key: 'paidAmount',
      header: t('salesInvoice.paidAmount'),
      render: (row) => <span className="text-sm">{formatMoney(row.paidAmount, row.currency)}</span>,
    },
    {
      key: 'status',
      header: t('salesInvoice.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={statusTone(row.status)}
          label={t(`salesInvoice.statuses.${row.status}`)}
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
    <RequirePermission permission="sales.invoices.view">
      <PageLayout
        title={t('salesInvoice.title')}
        icon={<FileCheck className="h-5 w-5" />}
        actions={
          <RequirePermission permission="sales.invoices.create">
            <Button>
              <Plus className="h-4 w-4 me-1" aria-hidden="true" />
              {t('salesInvoice.create')}
            </Button>
          </RequirePermission>
        }
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('salesInvoice.searchPlaceholder')}
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
