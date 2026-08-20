import { useState, useMemo } from 'react'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { useTranslation } from 'react-i18next'
import { Wrench } from 'lucide-react'

import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useAssetMaintenance } from '@/modules/assets/hooks/useAssetMaintenance'
import { formatMoney } from '@/core/utils/currency'

export default function AssetMaintenanceList() {
  const { t } = useTranslation('assets')
  const { maintenanceRecords, loading } = useAssetMaintenance()

  const { search, setSearch, debouncedSearch, page, setPage } = useDebouncedSearch()
  const [pageSize, setPageSize] = useState(10)

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return maintenanceRecords
    const q = debouncedSearch.toLowerCase()
    return maintenanceRecords.filter(
      (item) =>
        (item.asset && item.asset.toLowerCase().includes(q)) ||
        item.description.toLowerCase().includes(q),
    )
  }, [maintenanceRecords, debouncedSearch])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statusTone = (status: string) => {
    switch (status) {
      case 'scheduled': return 'info' as const
      case 'in_progress': return 'warning' as const
      case 'completed': return 'success' as const
      case 'cancelled': return 'neutral' as const
      default: return 'neutral' as const
    }
  }

  const columns: DataTableColumn<typeof maintenanceRecords[0]>[] = [
    { key: 'asset', header: t('maintenance.asset'), sortable: true },
    { key: 'type', header: t('maintenance.type'), sortable: true },
    { key: 'description', header: t('maintenance.description'), sortable: true },
    {
      key: 'scheduledDate',
      header: t('maintenance.scheduledDate'),
      sortable: true,
      render: (row) => (
        <span className="text-sm">{new Date(row.scheduledDate).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'completedDate',
      header: t('maintenance.completedDate'),
      render: (row) => (
        <span className="text-sm">{row.completedDate ? new Date(row.completedDate).toLocaleDateString() : '-'}</span>
      ),
    },
    {
      key: 'cost',
      header: t('maintenance.cost'),
      sortable: true,
      render: (row) => (
        <span className="text-sm font-medium">{formatMoney(row.cost, row.currency)}</span>
      ),
    },
    {
      key: 'status',
      header: t('maintenance.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={statusTone(row.status)}
          label={t(`maintenance.statuses.${row.status}`)}
        />
      ),
    },
  ]

  return (
    <RequirePermission permission="assets.maintenance.view">
      <PageLayout
        title={t('maintenance.title')}
        icon={<Wrench className="h-5 w-5" />}
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('maintenance.searchPlaceholder')}
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
