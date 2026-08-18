import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { TrendingDown } from 'lucide-react'

import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useDepreciationSchedules } from '@/modules/assets/hooks/useDepreciationSchedules'
import { formatMoney } from '@/core/utils/currency'

export default function DepreciationSchedules() {
  const { t } = useTranslation('assets')
  const { schedules, loading } = useDepreciationSchedules()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filtered = useMemo(() => {
    if (!search.trim()) return schedules
    const q = search.toLowerCase()
    return schedules.filter(
      (item) =>
        item.asset.toLowerCase().includes(q),
    )
  }, [schedules, search])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statusTone = (status: string) => {
    switch (status) {
      case 'draft': return 'neutral' as const
      case 'finalized': return 'success' as const
      case 'reversed': return 'warning' as const
      default: return 'neutral' as const
    }
  }

  const columns: DataTableColumn<typeof schedules[0]>[] = [
    { key: 'asset', header: t('depreciation.asset'), sortable: true },
    {
      key: 'periodStart',
      header: t('depreciation.periodStart'),
      sortable: true,
      render: (row) => (
        <span className="text-sm">{new Date(row.periodStart).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'periodEnd',
      header: t('depreciation.periodEnd'),
      sortable: true,
      render: (row) => (
        <span className="text-sm">{new Date(row.periodEnd).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'depreciationAmount',
      header: t('depreciation.amount'),
      sortable: true,
      render: (row) => (
        <span className="text-sm font-medium">{formatMoney(row.depreciationAmount, row.currency)}</span>
      ),
    },
    {
      key: 'accumulatedDepreciation',
      header: t('depreciation.accumulated'),
      sortable: true,
      render: (row) => (
        <span className="text-sm font-medium">{formatMoney(row.accumulatedDepreciation, row.currency)}</span>
      ),
    },
    {
      key: 'bookValue',
      header: t('depreciation.bookValue'),
      sortable: true,
      render: (row) => (
        <span className="text-sm font-medium">{formatMoney(row.bookValue, row.currency)}</span>
      ),
    },
    {
      key: 'status',
      header: t('depreciation.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={statusTone(row.status)}
          label={t(`depreciation.statuses.${row.status}`)}
        />
      ),
    },
  ]

  return (
    <RequirePermission permission="assets.asset.view">
      <PageLayout
        title={t('depreciation.title')}
        icon={<TrendingDown className="h-5 w-5" />}
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('depreciation.searchPlaceholder')}
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
