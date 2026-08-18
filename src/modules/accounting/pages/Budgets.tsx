import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart3 } from 'lucide-react'

import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useAccounts } from '@/modules/accounting/hooks/useAccounts'
import { formatMoney } from '@/core/utils/currency'

export default function Budgets() {
  const { t } = useTranslation('accounting')
  const { accounts, loading } = useAccounts()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filtered = useMemo(() => {
    if (!search.trim()) return accounts
    const q = search.toLowerCase()
    return accounts.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q),
    )
  }, [accounts, search])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const columns: DataTableColumn<typeof accounts[0]>[] = [
    { key: 'code', header: t('budget.accountCode'), sortable: true, width: '120px' },
    {
      key: 'name',
      header: t('budget.accountName'),
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-content">{row.name}</p>
          {row.nameAr && <p className="text-sm text-content-muted">{row.nameAr}</p>}
        </div>
      ),
    },
    {
      key: 'type',
      header: t('budget.type'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={row.type === 'expense' ? 'warning' : 'neutral'}
          label={t(`accounts.types.${row.type}`)}
        />
      ),
    },
    {
      key: 'currentBalance',
      header: t('budget.currentBalance'),
      sortable: true,
      render: (row) => (
        <span className="text-sm font-medium">{formatMoney(row.currentBalance, row.currency)}</span>
      ),
    },
  ]

  return (
    <RequirePermission permission="accounting.budget.view">
      <PageLayout
        title={t('budget.title')}
        icon={<BarChart3 className="h-5 w-5" />}
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('budget.searchPlaceholder')}
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
