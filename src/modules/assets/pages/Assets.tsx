import { useState, useMemo } from 'react'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { useTranslation } from 'react-i18next'
import { Package } from 'lucide-react'

import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useAssets } from '@/modules/assets/hooks/useAssets'
import { formatMoney } from '@/core/utils/currency'

export default function Assets() {
  const { t } = useTranslation('assets')
  const { assets, loading } = useAssets()

  const { search, setSearch, debouncedSearch, page, setPage } = useDebouncedSearch()
  const [pageSize, setPageSize] = useState(10)

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return assets
    const q = debouncedSearch.toLowerCase()
    return assets.filter(
      (item) =>
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q),
    )
  }, [assets, debouncedSearch])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statusTone = (status: string) => {
    switch (status) {
      case 'active': return 'success' as const
      case 'inactive': return 'neutral' as const
      case 'disposed': return 'warning' as const
      case 'transferred': return 'info' as const
      case 'under_maintenance': return 'warning' as const
      default: return 'neutral' as const
    }
  }

  const columns: DataTableColumn<typeof assets[0]>[] = [
    { key: 'code', header: t('assets.code'), sortable: true, width: '120px' },
    { key: 'name', header: t('assets.name'), sortable: true },
    { key: 'category', header: t('assets.category'), sortable: true },
    {
      key: 'purchaseValue',
      header: t('assets.purchaseValue'),
      sortable: true,
      render: (row) => (
        <span className="text-sm font-medium">{formatMoney(row.purchaseValue, row.currency)}</span>
      ),
    },
    {
      key: 'status',
      header: t('assets.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={statusTone(row.status)}
          label={t(`assets.statuses.${row.status}`)}
        />
      ),
    },
    {
      key: 'acquisitionDate',
      header: t('assets.acquisitionDate'),
      sortable: true,
      render: (row) => (
        <span className="text-sm">{new Date(row.acquisitionDate).toLocaleDateString()}</span>
      ),
    },
  ]

  return (
    <RequirePermission permission="assets.asset.view">
      <PageLayout
        title={t('assets.title')}
        icon={<Package className="h-5 w-5" />}
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('assets.searchPlaceholder')}
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
