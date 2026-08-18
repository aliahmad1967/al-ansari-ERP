import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen, Plus } from 'lucide-react'

import Button from '@/components/ui/Button'
import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import Dialog from '@/components/ui/Dialog'
import FormActions from '@/components/forms/FormActions'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useAccounts } from '@/modules/accounting/hooks/useAccounts'
import { formatMoney } from '@/core/utils/currency'

export default function ChartOfAccounts() {
  const { t } = useTranslation('accounting')
  const { accounts, loading, create, archive } = useAccounts()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [archiveTarget, setArchiveTarget] = useState<typeof accounts[0] | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return accounts
    const q = search.toLowerCase()
    return accounts.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        (item.nameAr ?? '').toLowerCase().includes(q),
    )
  }, [accounts, search])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const typeLabel = (type: string) => {
    switch (type) {
      case 'asset': return t('accounts.types.asset')
      case 'liability': return t('accounts.types.liability')
      case 'equity': return t('accounts.types.equity')
      case 'revenue': return t('accounts.types.revenue')
      case 'expense': return t('accounts.types.expense')
      default: return type
    }
  }

  const columns: DataTableColumn<typeof accounts[0]>[] = [
    { key: 'code', header: t('accounts.code'), sortable: true, width: '120px' },
    {
      key: 'name',
      header: t('accounts.name'),
      sortable: true,
      render: (row) => (
        <div style={{ paddingLeft: `${row.level * 20}px` }}>
          <p className="font-medium text-content">{row.name}</p>
          {row.nameAr && <p className="text-sm text-content-muted">{row.nameAr}</p>}
        </div>
      ),
    },
    {
      key: 'type',
      header: t('accounts.type'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={row.type === 'asset' ? 'success' : row.type === 'liability' ? 'warning' : row.type === 'revenue' ? 'info' : 'neutral'}
          label={typeLabel(row.type)}
        />
      ),
    },
    {
      key: 'currentBalance',
      header: t('accounts.balance'),
      sortable: true,
      render: (row) => (
        <span className="text-sm font-medium">{formatMoney(row.currentBalance, row.currency)}</span>
      ),
    },
    {
      key: 'isActive',
      header: t('accounts.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={row.isActive ? 'success' : 'neutral'}
          label={row.isActive ? t('accounts.active') : t('accounts.inactive')}
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
            {t('accounts.archive')}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <RequirePermission permission="accounting.accounts.view">
      <PageLayout
        title={t('accounts.title')}
        icon={<BookOpen className="h-5 w-5" />}
        actions={
          <RequirePermission permission="accounting.accounts.create">
            <Button onClick={() => create({ code: `AC-${String(accounts.length + 1).padStart(6, '0')}`, name: 'New Account', type: 'asset' })}>
              <Plus className="h-4 w-4 me-1" aria-hidden="true" />
              {t('accounts.create')}
            </Button>
          </RequirePermission>
        }
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('accounts.searchPlaceholder')}
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
          title={t('accounts.archive')}
          footer={
            <FormActions
              submitLabel={t('accounts.archive')}
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
          <p className="text-sm text-content-muted">{t('accounts.confirmArchive')}</p>
        </Dialog>
      </PageLayout>
    </RequirePermission>
  )
}
