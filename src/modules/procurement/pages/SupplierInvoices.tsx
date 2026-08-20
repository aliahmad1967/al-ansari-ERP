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
import { useSupplierInvoices } from '@/modules/procurement/hooks/useSupplierInvoices'
import { SupplierInvoiceForm } from '@/modules/procurement/forms/SupplierInvoiceForm'
import { formatMoney } from '@/core/utils/currency'

export default function SupplierInvoices() {
  const { t } = useTranslation('procurement')
  const { invoices, loading, create, register, validate, recordPayment } = useSupplierInvoices()

  const { search, setSearch, debouncedSearch, page, setPage } = useDebouncedSearch()
  const [pageSize, setPageSize] = useState(10)
  const [formOpen, setFormOpen] = useState(false)
  const [paymentTarget, setPaymentTarget] = useState<typeof invoices[0] | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer')

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return invoices
    const q = debouncedSearch.toLowerCase()
    return invoices.filter(
      (item) =>
        item.code.toLowerCase().includes(q) ||
        item.invoiceNumber.toLowerCase().includes(q) ||
        item.supplierId.toLowerCase().includes(q),
    )
  }, [invoices, debouncedSearch])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statusTone = (status: string) => {
    switch (status) {
      case 'draft': return 'neutral' as const
      case 'registered': return 'info' as const
      case 'validated': return 'success' as const
      case 'partially_paid': return 'warning' as const
      case 'paid': return 'success' as const
      case 'overdue': return 'warning' as const
      default: return 'neutral' as const
    }
  }

  const columns: DataTableColumn<typeof invoices[0]>[] = [
    { key: 'code', header: t('supplierInvoice.code'), sortable: true, width: '120px' },
    {
      key: 'invoiceDate',
      header: t('supplierInvoice.invoiceDate'),
      sortable: true,
      render: (row) => (
        <span className="text-sm text-content-muted">
          {new Date(row.invoiceDate).toLocaleDateString()}
        </span>
      ),
    },
    { key: 'invoiceNumber', header: t('supplierInvoice.invoiceNumber'), sortable: true },
    { key: 'supplierId', header: t('supplierInvoice.supplier'), sortable: true },
    {
      key: 'totalAmount',
      header: t('supplierInvoice.totalAmount'),
      sortable: true,
      render: (row) => (
        <span className="text-sm font-mono">{formatMoney(row.totalAmount)}</span>
      ),
    },
    {
      key: 'dueDate',
      header: t('supplierInvoice.dueDate'),
      sortable: true,
      render: (row) => (
        <span className="text-sm text-content-muted">
          {new Date(row.dueDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'paidAmount',
      header: t('supplierInvoice.paidAmount'),
      sortable: true,
      render: (row) => (
        <span className="text-sm font-mono">{formatMoney(row.paidAmount)}</span>
      ),
    },
    {
      key: 'status',
      header: t('supplierInvoice.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={statusTone(row.status)}
          label={t(`supplierInvoice.statusValues.${row.status}`)}
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
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); register(row._id) }}>
              {t('supplierInvoice.register')}
            </Button>
          )}
          {row.status === 'registered' && (
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); validate(row._id) }}>
              {t('supplierInvoice.validate')}
            </Button>
          )}
          {(row.status === 'validated' || row.status === 'partially_paid') && (
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setPaymentTarget(row); setPaymentAmount('') }}>
              {t('supplierInvoice.recordPayment')}
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <RequirePermission permission="procurement.invoices.view">
      <PageLayout
        title={t('supplierInvoice.title')}
        description={t('supplierInvoice.description')}
        icon={<FileCheck className="h-5 w-5" />}
        actions={
          <RequirePermission permission="procurement.invoices.create">
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 me-1" aria-hidden="true" />
              {t('supplierInvoice.create')}
            </Button>
          </RequirePermission>
        }
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('supplierInvoice.searchPlaceholder')}
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

        <SupplierInvoiceForm
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={(input) => { create(input); setFormOpen(false) }}
        />

        <Dialog
          open={!!paymentTarget}
          onOpenChange={(open) => { if (!open) setPaymentTarget(null) }}
          title={t('supplierInvoice.recordPayment')}
          footer={
            <FormActions
              submitLabel={t('supplierInvoice.recordPayment')}
              onCancel={() => setPaymentTarget(null)}
              onSubmit={() => {
                if (paymentTarget && paymentAmount) {
                  const remaining = paymentTarget.netAmount - paymentTarget.paidAmount
                  const amount = Math.min(parseFloat(paymentAmount), remaining)
                  if (amount > 0) {
                    const date = new Date().toISOString()
                    recordPayment(paymentTarget._id, amount, paymentMethod, '', date)
                  }
                  setPaymentTarget(null)
                }
              }}
            />
          }
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-content">{t('supplierInvoice.paymentAmount')}</label>
              <input
                type="number"
                className="w-full rounded-md border border-border bg-surface p-2 text-sm text-content"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                max={paymentTarget ? paymentTarget.netAmount - paymentTarget.paidAmount : undefined}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-content">{t('supplierInvoice.paymentMethod')}</label>
              <select
                className="w-full rounded-md border border-border bg-surface p-2 text-sm text-content"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="bank_transfer">{t('supplierInvoice.bankTransfer')}</option>
                <option value="cash">{t('supplierInvoice.cash')}</option>
                <option value="check">{t('supplierInvoice.check')}</option>
              </select>
            </div>
          </div>
        </Dialog>
      </PageLayout>
    </RequirePermission>
  )
}
