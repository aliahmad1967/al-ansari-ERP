import { useState, useMemo } from 'react'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { useTranslation } from 'react-i18next'
import { FileText } from 'lucide-react'

import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { usePayslips } from '@/modules/hr/hooks/usePayslips'
import { usePayrollPeriods } from '@/modules/hr/hooks/usePayrollPeriods'
import { useEmployees } from '@/modules/hr/hooks/useEmployees'

export default function Payslips() {
  const { t } = useTranslation('hr')
  const { items: payslips, loading } = usePayslips()
  const { items: periods } = usePayrollPeriods()
  const { items: employees } = useEmployees()

  const { search, setSearch, debouncedSearch, page, setPage } = useDebouncedSearch()
  const [pageSize, setPageSize] = useState(10)

  const periodMap = useMemo(() => {
    const map = new Map<string, typeof periods[0]>()
    for (const p of periods) map.set(p._id, p)
    return map
  }, [periods])

  const employeeMap = useMemo(() => {
    const map = new Map<string, typeof employees[0]>()
    for (const e of employees) map.set(e._id, e)
    return map
  }, [employees])

  const enriched = useMemo(() => {
    return payslips.map((ps) => ({
      ...ps,
      employee: employeeMap.get(ps.employeeId),
      period: periodMap.get(ps.periodId),
    }))
  }, [payslips, employeeMap, periodMap])

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return enriched
    const q = debouncedSearch.toLowerCase()
    return enriched.filter((item) => {
      const emp = item.employee
      return (
        item.payslipNumber.toLowerCase().includes(q) ||
        (emp?.firstName?.toLowerCase().includes(q)) ||
        (emp?.lastName?.toLowerCase().includes(q)) ||
        (emp?.employeeNumber?.toLowerCase().includes(q)) ||
        (emp?.firstNameAr ?? '').includes(debouncedSearch) ||
        (emp?.lastNameAr ?? '').includes(debouncedSearch) ||
        (item.period?.name ?? '').toLowerCase().includes(q)
      )
    })
  }, [enriched, debouncedSearch])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)

  const columns: DataTableColumn<typeof enriched[0]>[] = [
    {
      key: 'payslipNumber',
      header: t('payslip.number'),
      sortable: true,
      width: '140px',
      render: (row) => <span className="font-mono text-sm">{row.payslipNumber}</span>,
    },
    {
      key: 'employeeId',
      header: t('payslip.employee'),
      render: (row) => {
        const emp = row.employee
        if (!emp) return <span className="text-sm text-content-muted">-</span>
        return (
          <div>
            <p className="font-medium text-content text-sm">{emp.firstName} {emp.lastName}</p>
            {(emp.firstNameAr || emp.lastNameAr) && (
              <p className="text-xs text-content-muted">{emp.firstNameAr} {emp.lastNameAr}</p>
            )}
          </div>
        )
      },
    },
    {
      key: 'periodId',
      header: t('payslip.period'),
      render: (row) => <span className="text-sm">{row.period?.name ?? '-'}</span>,
    },
    {
      key: 'basicSalary',
      header: t('payslip.basicSalary'),
      sortable: true,
      render: (row) => <span className="text-sm font-mono">{formatCurrency(row.basicSalary)}</span>,
    },
    {
      key: 'totalEarnings',
      header: t('payslip.totalEarnings'),
      sortable: true,
      render: (row) => <span className="text-sm font-mono text-green-600">{formatCurrency(row.totalEarnings)}</span>,
    },
    {
      key: 'totalDeductions',
      header: t('payslip.totalDeductions'),
      sortable: true,
      render: (row) => <span className="text-sm font-mono text-red-600">{formatCurrency(row.totalDeductions)}</span>,
    },
    {
      key: 'netPay',
      header: t('payslip.netPay'),
      sortable: true,
      render: (row) => <span className="text-sm font-mono font-semibold">{formatCurrency(row.netPay)}</span>,
    },
    {
      key: 'generatedAt',
      header: t('payslip.generatedAt'),
      sortable: true,
      render: (row) => new Date(row.generatedAt).toLocaleDateString(),
    },
  ]

  return (
    <RequirePermission permission="hr.payroll.view">
      <PageLayout
        title={t('payslip.title')}
        description={t('payslip.description')}
        icon={<FileText className="h-5 w-5" />}
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('payslip.searchPlaceholder')}
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
