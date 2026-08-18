import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, Plus } from 'lucide-react'

import Button from '@/components/ui/Button'
import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useFiscalYears } from '@/modules/accounting/hooks/useFiscalYears'

export default function FiscalYears() {
  const { t } = useTranslation('accounting')
  const { years, loading } = useFiscalYears()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filtered = useMemo(() => {
    if (!search.trim()) return years
    const q = search.toLowerCase()
    return years.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q),
    )
  }, [years, search])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statusTone = (status: string) => {
    switch (status) {
      case 'draft': return 'neutral' as const
      case 'open': return 'success' as const
      case 'closed': return 'warning' as const
      default: return 'neutral' as const
    }
  }

  const columns: DataTableColumn<typeof years[0]>[] = [
    { key: 'code', header: t('fiscal.code'), sortable: true, width: '120px' },
    { key: 'name', header: t('fiscal.name'), sortable: true },
    {
      key: 'startDate',
      header: t('fiscal.startDate'),
      sortable: true,
      render: (row) => (
        <span className="text-sm">{new Date(row.startDate).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'endDate',
      header: t('fiscal.endDate'),
      sortable: true,
      render: (row) => (
        <span className="text-sm">{new Date(row.endDate).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'status',
      header: t('fiscal.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={statusTone(row.status)}
          label={t(`fiscal.statuses.${row.status}`)}
        />
      ),
    },
    {
      key: 'isClosed',
      header: t('fiscal.closed'),
      render: (row) => (
        <StatusBadge
          tone={row.isClosed ? 'warning' : 'success'}
          label={row.isClosed ? t('fiscal.yes') : t('fiscal.no')}
        />
      ),
    },
  ]

  return (
    <RequirePermission permission="accounting.fiscal.view">
      <PageLayout
        title={t('fiscal.title')}
        icon={<Calendar className="h-5 w-5" />}
        actions={
          <RequirePermission permission="accounting.fiscal.create">
            <Button onClick={() => {}}>
              <Plus className="h-4 w-4 me-1" aria-hidden="true" />
              {t('fiscal.create')}
            </Button>
          </RequirePermission>
        }
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('fiscal.searchPlaceholder')}
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
