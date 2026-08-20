import { useState, useMemo } from 'react'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { useTranslation } from 'react-i18next'
import { Users, Plus } from 'lucide-react'

import Button from '@/components/ui/Button'
import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import Dialog from '@/components/ui/Dialog'
import FormActions from '@/components/forms/FormActions'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useCustomers } from '@/modules/sales/hooks/useCustomers'
import { formatMoney } from '@/core/utils/currency'

export default function Customers() {
  const { t } = useTranslation('sales')
  const { customers, loading, create, update, archive } = useCustomers()

  const { search, setSearch, debouncedSearch, page, setPage } = useDebouncedSearch()
  const [pageSize, setPageSize] = useState(10)
  const [archiveTarget, setArchiveTarget] = useState<typeof customers[0] | null>(null)

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return customers
    const q = debouncedSearch.toLowerCase()
    return customers.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        (item.contactPerson ?? '').toLowerCase().includes(q),
    )
  }, [customers, debouncedSearch])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statusTone = (status: string) => {
    switch (status) {
      case 'active': return 'success' as const
      case 'inactive': return 'neutral' as const
      case 'suspended': return 'warning' as const
      default: return 'neutral' as const
    }
  }

  const columns: DataTableColumn<typeof customers[0]>[] = [
    { key: 'code', header: t('customer.code'), sortable: true, width: '120px' },
    {
      key: 'name',
      header: t('customer.name'),
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-content">{row.name}</p>
          {row.nameAr && <p className="text-sm text-content-muted">{row.nameAr}</p>}
        </div>
      ),
    },
    {
      key: 'contactPerson',
      header: t('customer.contactPerson'),
      render: (row) => (
        <span className="text-sm text-content-muted">{row.contactPerson ?? '-'}</span>
      ),
    },
    {
      key: 'phone',
      header: t('customer.phone'),
      render: (row) => (
        <span className="text-sm text-content-muted">{row.phone ?? '-'}</span>
      ),
    },
    {
      key: 'balance',
      header: t('customer.balance'),
      sortable: true,
      render: (row) => (
        <span className="text-sm font-medium">{formatMoney(row.balance, row.currency)}</span>
      ),
    },
    {
      key: 'status',
      header: t('customer.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={statusTone(row.status)}
          label={t(`customer.statuses.${row.status}`)}
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
    <RequirePermission permission="sales.customers.view">
      <PageLayout
        title={t('customer.title')}
        icon={<Users className="h-5 w-5" />}
        actions={
          <RequirePermission permission="sales.customers.create">
            <Button onClick={() => create({ code: `CUS-${String(customers.length + 1).padStart(6, '0')}`, name: 'New Customer' })}>
              <Plus className="h-4 w-4 me-1" aria-hidden="true" />
              {t('customer.create')}
            </Button>
          </RequirePermission>
        }
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('customer.searchPlaceholder')}
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
