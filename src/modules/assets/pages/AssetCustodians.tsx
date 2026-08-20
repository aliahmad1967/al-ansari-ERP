import { useState, useMemo } from 'react'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { useTranslation } from 'react-i18next'
import { User } from 'lucide-react'

import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useAssetCustodians } from '@/modules/assets/hooks/useAssetCustodians'

export default function AssetCustodians() {
  const { t } = useTranslation('assets')
  const { custodians, loading } = useAssetCustodians()

  const { search, setSearch, debouncedSearch, page, setPage } = useDebouncedSearch()
  const [pageSize, setPageSize] = useState(10)

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return custodians
    const q = debouncedSearch.toLowerCase()
    return custodians.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q),
    )
  }, [custodians, debouncedSearch])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const columns: DataTableColumn<typeof custodians[0]>[] = [
    { key: 'name', header: t('custodians.name'), sortable: true },
    { key: 'nameAr', header: t('custodians.nameAr'), sortable: true },
    { key: 'department', header: t('custodians.department'), sortable: true },
    {
      key: 'email',
      header: t('custodians.email'),
      render: (row) => (
        <span className="text-sm text-content-muted">{row.email ?? '-'}</span>
      ),
    },
    {
      key: 'phone',
      header: t('custodians.phone'),
      render: (row) => (
        <span className="text-sm text-content-muted">{row.phone ?? '-'}</span>
      ),
    },
  ]

  return (
    <RequirePermission permission="assets.asset.view">
      <PageLayout
        title={t('custodians.title')}
        icon={<User className="h-5 w-5" />}
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('custodians.searchPlaceholder')}
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
