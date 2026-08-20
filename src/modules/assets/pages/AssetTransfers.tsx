import { useState, useMemo } from 'react'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { useTranslation } from 'react-i18next'
import { ArrowRightLeft } from 'lucide-react'

import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useAssetTransfers } from '@/modules/assets/hooks/useAssetTransfers'

export default function AssetTransfers() {
  const { t } = useTranslation('assets')
  const { transfers, loading } = useAssetTransfers()

  const { search, setSearch, debouncedSearch, page, setPage } = useDebouncedSearch()
  const [pageSize, setPageSize] = useState(10)

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return transfers
    const q = debouncedSearch.toLowerCase()
    return transfers.filter(
      (item) =>
        item.asset.toLowerCase().includes(q) ||
        item.reason.toLowerCase().includes(q),
    )
  }, [transfers, debouncedSearch])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statusTone = (status: string) => {
    switch (status) {
      case 'pending': return 'info' as const
      case 'approved': return 'success' as const
      case 'rejected': return 'danger' as const
      case 'completed': return 'success' as const
      default: return 'neutral' as const
    }
  }

  const columns: DataTableColumn<typeof transfers[0]>[] = [
    { key: 'asset', header: t('transfers.asset'), sortable: true },
    { key: 'fromLocation', header: t('transfers.fromLocation'), sortable: true },
    { key: 'toLocation', header: t('transfers.toLocation'), sortable: true },
    {
      key: 'transferDate',
      header: t('transfers.transferDate'),
      sortable: true,
      render: (row) => (
        <span className="text-sm">{new Date(row.transferDate).toLocaleDateString()}</span>
      ),
    },
    { key: 'reason', header: t('transfers.reason'), sortable: true },
    {
      key: 'status',
      header: t('transfers.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={statusTone(row.status)}
          label={t(`transfers.statuses.${row.status}`)}
        />
      ),
    },
  ]

  return (
    <RequirePermission permission="assets.asset.view">
      <PageLayout
        title={t('transfers.title')}
        icon={<ArrowRightLeft className="h-5 w-5" />}
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('transfers.searchPlaceholder')}
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
