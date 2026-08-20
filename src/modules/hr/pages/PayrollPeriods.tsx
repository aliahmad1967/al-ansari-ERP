import { useState, useMemo } from 'react'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { useTranslation } from 'react-i18next'
import { Calendar, Plus } from 'lucide-react'

import Button from '@/components/ui/Button'
import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { usePayrollPeriods } from '@/modules/hr/hooks/usePayrollPeriods'
import PayrollPeriodForm from '@/modules/hr/forms/PayrollPeriodForm'

export default function PayrollPeriods() {
  const { t } = useTranslation('hr')
  const { items: periods, loading, create } = usePayrollPeriods()

  const { search, setSearch, debouncedSearch, page, setPage } = useDebouncedSearch()
  const [pageSize, setPageSize] = useState(10)
  const [formOpen, setFormOpen] = useState(false)

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return periods
    const q = debouncedSearch.toLowerCase()
    return periods.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.nameAr ?? '').includes(debouncedSearch) ||
        String(item.year).includes(q),
    )
  }, [periods, debouncedSearch])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statusTone = (status: string) => {
    switch (status) {
      case 'draft': return 'neutral' as const
      case 'open': return 'info' as const
      case 'closed': return 'success' as const
      default: return 'neutral' as const
    }
  }

  const columns: DataTableColumn<typeof periods[0]>[] = [
    {
      key: 'name',
      header: t('payrollPeriod.name'),
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-content">{row.name}</p>
          {row.nameAr && <p className="text-sm text-content-muted">{row.nameAr}</p>}
        </div>
      ),
    },
    {
      key: 'year',
      header: t('payrollPeriod.year'),
      sortable: true,
      render: (row) => `${row.year} / ${String(row.month).padStart(2, '0')}`,
    },
    {
      key: 'startDate',
      header: t('payrollPeriod.startDate'),
      sortable: true,
      render: (row) => new Date(row.startDate).toLocaleDateString(),
    },
    {
      key: 'endDate',
      header: t('payrollPeriod.endDate'),
      sortable: true,
      render: (row) => new Date(row.endDate).toLocaleDateString(),
    },
    {
      key: 'status',
      header: t('payrollPeriod.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge tone={statusTone(row.status)} label={t(`payrollPeriod.statusValues.${row.status}`)} />
      ),
    },
  ]

  return (
    <RequirePermission permission="hr.payroll.view">
      <PageLayout
        title={t('payrollPeriod.title')}
        description={t('payrollPeriod.description')}
        icon={<Calendar className="h-5 w-5" />}
        actions={
          <RequirePermission permission="hr.payroll.create">
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 me-1" aria-hidden="true" />
              {t('payrollPeriod.create')}
            </Button>
          </RequirePermission>
        }
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('payrollPeriod.searchPlaceholder')}
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

        <PayrollPeriodForm
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={(input) => create(input)}
        />
      </PageLayout>
    </RequirePermission>
  )
}
