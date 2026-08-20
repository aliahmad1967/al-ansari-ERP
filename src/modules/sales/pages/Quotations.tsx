import { useState, useMemo } from 'react'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { useTranslation } from 'react-i18next'
import { FileText, Plus } from 'lucide-react'

import Button from '@/components/ui/Button'
import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import Dialog from '@/components/ui/Dialog'
import FormActions from '@/components/forms/FormActions'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useQuotations } from '@/modules/sales/hooks/useQuotations'
import { formatMoney } from '@/core/utils/currency'

export default function Quotations() {
  const { t } = useTranslation('sales')
  const { quotations, loading, archive } = useQuotations()

  const { search, setSearch, debouncedSearch, page, setPage } = useDebouncedSearch()
  const [pageSize, setPageSize] = useState(10)
  const [archiveTarget, setArchiveTarget] = useState<typeof quotations[0] | null>(null)

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return quotations
    const q = debouncedSearch.toLowerCase()
    return quotations.filter(
      (item) => item.code.toLowerCase().includes(q),
    )
  }, [quotations, debouncedSearch])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statusTone = (status: string) => {
    switch (status) {
      case 'draft': return 'neutral' as const
      case 'sent': return 'info' as const
      case 'accepted': return 'success' as const
      case 'rejected': return 'danger' as const
      case 'expired': return 'warning' as const
      case 'converted': return 'primary' as const
      default: return 'neutral' as const
    }
  }

  const columns: DataTableColumn<typeof quotations[0]>[] = [
    { key: 'code', header: t('quotation.code'), sortable: true, width: '140px' },
    { key: 'quotationDate', header: t('quotation.quotationDate'), sortable: true, render: (row) => new Date(row.quotationDate).toLocaleDateString() },
    { key: 'validUntilDate', header: t('quotation.validUntilDate'), render: (row) => new Date(row.validUntilDate).toLocaleDateString() },
    {
      key: 'netAmount',
      header: t('quotation.netAmount'),
      sortable: true,
      render: (row) => <span className="font-medium">{formatMoney(row.netAmount, row.currency)}</span>,
    },
    {
      key: 'status',
      header: t('quotation.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={statusTone(row.status)}
          label={t(`quotation.statuses.${row.status}`)}
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
    <RequirePermission permission="sales.quotations.view">
      <PageLayout
        title={t('quotation.title')}
        icon={<FileText className="h-5 w-5" />}
        actions={
          <RequirePermission permission="sales.quotations.create">
            <Button>
              <Plus className="h-4 w-4 me-1" aria-hidden="true" />
              {t('quotation.create')}
            </Button>
          </RequirePermission>
        }
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('quotation.searchPlaceholder')}
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
