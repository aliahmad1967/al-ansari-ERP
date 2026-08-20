import { useState, useMemo } from 'react'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { useTranslation } from 'react-i18next'
import { MapPin } from 'lucide-react'

import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useAssetLocations } from '@/modules/assets/hooks/useAssetLocations'

export default function AssetLocations() {
  const { t } = useTranslation('assets')
  const { locations, loading } = useAssetLocations()

  const { search, setSearch, debouncedSearch, page, setPage } = useDebouncedSearch()
  const [pageSize, setPageSize] = useState(10)

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return locations
    const q = debouncedSearch.toLowerCase()
    return locations.filter(
      (item) =>
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q),
    )
  }, [locations, debouncedSearch])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const columns: DataTableColumn<typeof locations[0]>[] = [
    { key: 'code', header: t('locations.code'), sortable: true, width: '120px' },
    { key: 'name', header: t('locations.name'), sortable: true },
    { key: 'nameAr', header: t('locations.nameAr'), sortable: true },
    { key: 'address', header: t('locations.address'), sortable: true },
  ]

  return (
    <RequirePermission permission="assets.asset.view">
      <PageLayout
        title={t('locations.title')}
        icon={<MapPin className="h-5 w-5" />}
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('locations.searchPlaceholder')}
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
