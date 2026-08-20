import { useState, useMemo } from 'react'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { useTranslation } from 'react-i18next'
import { Trash2 } from 'lucide-react'

import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useAssetDisposals } from '@/modules/assets/hooks/useAssetDisposals'
import { formatMoney } from '@/core/utils/currency'

export default function AssetDisposals() {
  const { t } = useTranslation('assets')
  const { disposals, loading } = useAssetDisposals()

  const { search, setSearch, debouncedSearch, page, setPage } = useDebouncedSearch()
  const [pageSize, setPageSize] = useState(10)

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return disposals
    const q = debouncedSearch.toLowerCase()
    return disposals.filter(
      (item) =>
        item.asset.toLowerCase().includes(q) ||
        item.disposalMethod.toLowerCase().includes(q),
    )
  }, [disposals, debouncedSearch])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statusTone = (status: string) => {
    switch (status) {
      case 'pending': return 'info' as const
      case 'approved': return 'success' as const
      case 'completed': return 'success' as const
      case 'rejected': return 'danger' as const
      default: return 'neutral' as const
    }
  }

  const columns: DataTableColumn<typeof disposals[0]>[] = [
    { key: 'asset', header: t('disposals.asset'), sortable: true },
    {
      key: 'disposalDate',
      header: t('disposals.disposalDate'),
      sortable: true,
      render: (row) => (
        <span className="text-sm">{new Date(row.disposalDate).toLocaleDateString()}</span>
      ),
    },
    { key: 'disposalMethod', header: t('disposals.disposalMethod'), sortable: true },
    {
      key: 'disposalValue',
      header: t('disposals.disposalValue'),
      sortable: true,
      render: (row) => (
        <span className="text-sm font-medium">{formatMoney(row.disposalValue, row.currency)}</span>
      ),
    },
    {
      key: 'bookValue',
      header: t('disposals.bookValue'),
      sortable: true,
      render: (row) => (
        <span className="text-sm font-medium">{formatMoney(row.bookValue, row.currency)}</span>
      ),
    },
    {
      key: 'gainLoss',
      header: t('disposals.gainLoss'),
      sortable: true,
      render: (row) => (
        <span className="text-sm font-medium">{formatMoney(row.gainLoss, row.currency)}</span>
      ),
    },
    {
      key: 'status',
      header: t('disposals.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={statusTone(row.status)}
          label={t(`disposals.statuses.${row.status}`)}
        />
      ),
    },
  ]

  return (
    <RequirePermission permission="assets.asset.view">
      <PageLayout
        title={t('disposals.title')}
        icon={<Trash2 className="h-5 w-5" />}
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('disposals.searchPlaceholder')}
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
      </PageLayout>
    </RequirePermission>
  )
}
