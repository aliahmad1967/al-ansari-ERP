import { useState, useMemo } from 'react'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { useTranslation } from 'react-i18next'
import { FolderTree } from 'lucide-react'

import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useAssetCategories } from '@/modules/assets/hooks/useAssetCategories'

export default function AssetCategories() {
  const { t } = useTranslation('assets')
  const { categories, loading } = useAssetCategories()

  const { search, setSearch, debouncedSearch, page, setPage } = useDebouncedSearch()
  const [pageSize, setPageSize] = useState(10)

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return categories
    const q = debouncedSearch.toLowerCase()
    return categories.filter(
      (item) =>
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q),
    )
  }, [categories, debouncedSearch])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const columns: DataTableColumn<typeof categories[0]>[] = [
    { key: 'code', header: t('categories.code'), sortable: true, width: '120px' },
    { key: 'name', header: t('categories.name'), sortable: true },
    { key: 'nameAr', header: t('categories.nameAr'), sortable: true },
    { key: 'defaultUsefulLife', header: t('categories.defaultUsefulLife'), sortable: true },
    { key: 'defaultDepreciationMethod', header: t('categories.defaultDepreciationMethod'), sortable: true },
  ]

  return (
    <RequirePermission permission="assets.asset-category.view">
      <PageLayout
        title={t('categories.title')}
        icon={<FolderTree className="h-5 w-5" />}
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('categories.searchPlaceholder')}
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
