import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FileText } from 'lucide-react'

import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useJournalEntries } from '@/modules/accounting/hooks/useJournalEntries'
import { formatMoney } from '@/core/utils/currency'

export default function JournalEntries() {
  const { t } = useTranslation('accounting')
  const { entries, loading } = useJournalEntries()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filtered = useMemo(() => {
    if (!search.trim()) return entries
    const q = search.toLowerCase()
    return entries.filter(
      (item) =>
        item.description.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q),
    )
  }, [entries, search])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statusTone = (status: string) => {
    switch (status) {
      case 'draft': return 'neutral' as const
      case 'reviewed': return 'info' as const
      case 'approved': return 'success' as const
      case 'posted': return 'success' as const
      case 'reversed': return 'warning' as const
      default: return 'neutral' as const
    }
  }

  const columns: DataTableColumn<typeof entries[0]>[] = [
    { key: 'code', header: t('journal.code'), sortable: true, width: '120px' },
    {
      key: 'entryDate',
      header: t('journal.date'),
      sortable: true,
      render: (row) => (
        <span className="text-sm">{new Date(row.entryDate).toLocaleDateString()}</span>
      ),
    },
    { key: 'description', header: t('journal.description'), sortable: true },
    {
      key: 'totalDebit',
      header: t('journal.debit'),
      sortable: true,
      render: (row) => (
        <span className="text-sm font-medium">{formatMoney(row.totalDebit, row.currency)}</span>
      ),
    },
    {
      key: 'totalCredit',
      header: t('journal.credit'),
      sortable: true,
      render: (row) => (
        <span className="text-sm font-medium">{formatMoney(row.totalCredit, row.currency)}</span>
      ),
    },
    {
      key: 'status',
      header: t('journal.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={statusTone(row.status)}
          label={t(`journal.statuses.${row.status}`)}
        />
      ),
    },
    {
      key: 'referenceNumber',
      header: t('journal.reference'),
      render: (row) => (
        <span className="text-sm text-content-muted">{row.referenceNumber ?? '-'}</span>
      ),
    },
  ]

  return (
    <RequirePermission permission="accounting.journal.view">
      <PageLayout
        title={t('journal.title')}
        icon={<FileText className="h-5 w-5" />}
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('journal.searchPlaceholder')}
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
