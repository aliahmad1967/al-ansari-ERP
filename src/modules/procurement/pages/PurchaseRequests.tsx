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
import { usePurchaseRequests } from '@/modules/procurement/hooks/usePurchaseRequests'
import { PurchaseRequestForm } from '@/modules/procurement/forms/PurchaseRequestForm'
import { formatMoney } from '@/core/utils/currency'

export default function PurchaseRequests() {
  const { t } = useTranslation('procurement')
  const { requests, loading, create, approve, reject, cancel } = usePurchaseRequests()

  const { search, setSearch, debouncedSearch, page, setPage } = useDebouncedSearch()
  const [pageSize, setPageSize] = useState(10)
  const [formOpen, setFormOpen] = useState(false)
  const [rejectTarget, setRejectTarget] = useState<typeof requests[0] | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [cancelTarget, setCancelTarget] = useState<typeof requests[0] | null>(null)

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return requests
    const q = debouncedSearch.toLowerCase()
    return requests.filter(
      (item) =>
        item.code.toLowerCase().includes(q) ||
        item.requestedByUserId.toLowerCase().includes(q) ||
        (item.notes ?? '').toLowerCase().includes(q),
    )
  }, [requests, debouncedSearch])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statusTone = (status: string) => {
    switch (status) {
      case 'draft': return 'neutral' as const
      case 'pending_approval': return 'warning' as const
      case 'approved': return 'success' as const
      case 'rejected': return 'warning' as const
      case 'converted': return 'info' as const
      case 'cancelled': return 'neutral' as const
      default: return 'neutral' as const
    }
  }

  const columns: DataTableColumn<typeof requests[0]>[] = [
    { key: 'code', header: t('purchaseRequest.code'), sortable: true, width: '120px' },
    {
      key: 'requestDate',
      header: t('purchaseRequest.requestDate'),
      sortable: true,
      render: (row) => (
        <span className="text-sm text-content-muted">
          {new Date(row.requestDate).toLocaleDateString()}
        </span>
      ),
    },
    { key: 'requestedByUserId', header: t('purchaseRequest.requestedBy'), sortable: true },
    {
      key: 'totalEstimatedCost',
      header: t('purchaseRequest.totalEstimatedCost'),
      sortable: true,
      render: (row) => (
        <span className="text-sm font-mono">{formatMoney(row.totalEstimatedCost)}</span>
      ),
    },
    {
      key: 'notes',
      header: t('purchaseRequest.notes'),
      render: (row) => (
        <span className="text-sm text-content-muted truncate max-w-[200px] block">
          {row.notes ?? '-'}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('purchaseRequest.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={statusTone(row.status)}
          label={t(`purchaseRequest.statusValues.${row.status}`)}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '200px',
      render: (row) => (
        <div className="flex gap-1">
          {row.status === 'pending_approval' && (
            <>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); approve(row._id, 'system', 'system') }}>
                {t('purchaseRequest.approve')}
              </Button>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setRejectTarget(row); setRejectReason('') }}>
                {t('purchaseRequest.reject')}
              </Button>
            </>
          )}
          {row.status !== 'cancelled' && row.status !== 'converted' && (
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setCancelTarget(row) }}>
              {t('purchaseRequest.cancel')}
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <RequirePermission permission="procurement.requests.view">
      <PageLayout
        title={t('purchaseRequest.title')}
        description={t('purchaseRequest.description')}
        icon={<FileText className="h-5 w-5" />}
        actions={
          <RequirePermission permission="procurement.requests.create">
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 me-1" aria-hidden="true" />
              {t('purchaseRequest.create')}
            </Button>
          </RequirePermission>
        }
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('purchaseRequest.searchPlaceholder')}
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

        <PurchaseRequestForm
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={(input) => { create(input); setFormOpen(false) }}
        />

        <Dialog
          open={!!rejectTarget}
          onOpenChange={(open) => { if (!open) setRejectTarget(null) }}
          title={t('purchaseRequest.reject')}
          footer={
            <FormActions
              submitLabel={t('purchaseRequest.reject')}
              onCancel={() => setRejectTarget(null)}
              onSubmit={() => {
                if (rejectTarget) {
                  reject(rejectTarget._id, rejectReason, 'system', 'system')
                  setRejectTarget(null)
                }
              }}
            />
          }
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-content">{t('purchaseRequest.rejectionReason')}</label>
            <textarea
              className="w-full rounded-md border border-border bg-surface p-2 text-sm text-content"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
        </Dialog>

        <Dialog
          open={!!cancelTarget}
          onOpenChange={(open) => { if (!open) setCancelTarget(null) }}
          title={t('purchaseRequest.cancel')}
          footer={
            <FormActions
              submitLabel={t('purchaseRequest.cancel')}
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
          <p className="text-sm text-content-muted">{t('purchaseRequest.confirmCancel')}</p>
        </Dialog>
      </PageLayout>
    </RequirePermission>
  )
}
