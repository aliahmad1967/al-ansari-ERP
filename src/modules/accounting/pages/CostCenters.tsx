import { useState, useMemo } from 'react'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { useTranslation } from 'react-i18next'
import { LayoutGrid, Plus } from 'lucide-react'

import Button from '@/components/ui/Button'
import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import Dialog from '@/components/ui/Dialog'
import FormActions from '@/components/forms/FormActions'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useCostCenters } from '@/modules/accounting/hooks/useCostCenters'

export default function CostCenters() {
  const { t } = useTranslation('accounting')
  const { costCenters, loading, create, archive } = useCostCenters()

  const { search, setSearch, debouncedSearch, page, setPage } = useDebouncedSearch()
  const [pageSize, setPageSize] = useState(10)
  const [archiveTarget, setArchiveTarget] = useState<typeof costCenters[0] | null>(null)

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return costCenters
    const q = debouncedSearch.toLowerCase()
    return costCenters.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q),
    )
  }, [costCenters, debouncedSearch])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const columns: DataTableColumn<typeof costCenters[0]>[] = [
    { key: 'code', header: t('costCenter.code'), sortable: true, width: '120px' },
    {
      key: 'name',
      header: t('costCenter.name'),
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-content">{row.name}</p>
          {row.nameAr && <p className="text-sm text-content-muted">{row.nameAr}</p>}
        </div>
      ),
    },
    {
      key: 'description',
      header: t('costCenter.description'),
      render: (row) => (
        <span className="text-sm text-content-muted">{row.description ?? '-'}</span>
      ),
    },
    {
      key: 'isActive',
      header: t('costCenter.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={row.isActive ? 'success' : 'neutral'}
          label={row.isActive ? t('costCenter.active') : t('costCenter.inactive')}
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
            {t('costCenter.archive')}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <RequirePermission permission="accounting.costCenter.view">
      <PageLayout
        title={t('costCenter.title')}
        icon={<LayoutGrid className="h-5 w-5" />}
        actions={
          <RequirePermission permission="accounting.costCenter.create">
            <Button onClick={() => create({ code: `CC-${String(costCenters.length + 1).padStart(6, '0')}`, name: 'New Cost Center' })}>
              <Plus className="h-4 w-4 me-1" aria-hidden="true" />
              {t('costCenter.create')}
            </Button>
          </RequirePermission>
        }
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('costCenter.searchPlaceholder')}
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
          title={t('costCenter.archive')}
          footer={
            <FormActions
              submitLabel={t('costCenter.archive')}
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
          <p className="text-sm text-content-muted">{t('costCenter.confirmArchive')}</p>
        </Dialog>
      </PageLayout>
    </RequirePermission>
  )
}
