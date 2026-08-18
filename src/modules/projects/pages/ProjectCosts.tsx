import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DollarSign, Plus } from 'lucide-react'

import Button from '@/components/ui/Button'
import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import Dialog from '@/components/ui/Dialog'
import FormActions from '@/components/forms/FormActions'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useProjectExpenses } from '@/modules/projects/hooks/useProjectExpenses'
import { useProjectBudgets } from '@/modules/projects/hooks/useProjectBudgets'
import { ProjectExpenseStatus } from '@/core/models/ProjectExpense'

export default function ProjectCosts() {
  const { t } = useTranslation('projects')
  const { items: expenses, loading: expensesLoading, create: createExpense, archive: archiveExpense } = useProjectExpenses()
  const { items: budgets, loading: budgetsLoading, create: createBudget, archive: archiveBudget } = useProjectBudgets()

  const [activeTab, setActiveTab] = useState<'expenses' | 'budgets'>('expenses')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [archiveTarget, setArchiveTarget] = useState<{ type: string; id: string; name: string } | null>(null)

  const filteredExpenses = useMemo(() => {
    if (!search.trim()) return expenses
    const q = search.toLowerCase()
    return expenses.filter(
      (item) =>
        item.description.toLowerCase().includes(q) ||
        (item.descriptionAr ?? '').includes(search) ||
        item.category.toLowerCase().includes(q),
    )
  }, [expenses, search])

  const filteredBudgets = useMemo(() => {
    if (!search.trim()) return budgets
    const q = search.toLowerCase()
    return budgets.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.nameAr ?? '').includes(search) ||
        item.category.toLowerCase().includes(q),
    )
  }, [budgets, search])

  const items = activeTab === 'expenses' ? filteredExpenses : filteredBudgets
  const paginated = items.slice((page - 1) * pageSize, page * pageSize)

  const totalExpenses = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses])
  const totalBudget = useMemo(() => budgets.reduce((sum, b) => sum + b.allocatedAmount, 0), [budgets])
  const totalSpent = useMemo(() => budgets.reduce((sum, b) => sum + b.spentAmount, 0), [budgets])

  const expenseStatusTone = (status: string) => {
    switch (status) {
      case ProjectExpenseStatus.Approved: return 'success'
      case ProjectExpenseStatus.Rejected: return 'danger'
      case ProjectExpenseStatus.Reimbursed: return 'info'
      default: return 'neutral'
    }
  }

  const expenseColumns: DataTableColumn<(typeof expenses)[0]>[] = [
    {
      key: 'description',
      header: t('expense.description_label'),
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-content">{row.description}</p>
          {row.descriptionAr && <p className="text-sm text-content-muted">{row.descriptionAr}</p>}
        </div>
      ),
    },
    {
      key: 'category',
      header: t('expense.category'),
      sortable: true,
      render: (row) => <span className="text-sm text-content-muted">{t(`expense.categories.${row.category}`)}</span>,
    },
    {
      key: 'amount',
      header: t('expense.amount'),
      sortable: true,
      render: (row) => <span className="font-medium">{row.amount.toLocaleString()} {row.currency}</span>,
    },
    {
      key: 'expenseDate',
      header: t('expense.expenseDate'),
      sortable: true,
      render: (row) => new Date(row.expenseDate).toLocaleDateString(),
    },
    {
      key: 'status',
      header: t('expense.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={expenseStatusTone(row.status) as 'success' | 'danger' | 'info' | 'neutral'}
          label={t(`expense.statuses.${row.status}`)}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '100px',
      render: (row) => (
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setArchiveTarget({ type: 'expense', id: row._id, name: row.description }) }}>
          {t('expense.archive')}
        </Button>
      ),
    },
  ]

  const budgetColumns: DataTableColumn<(typeof budgets)[0]>[] = [
    {
      key: 'name',
      header: t('budget.name'),
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-content">{row.name}</p>
          {row.nameAr && <p className="text-sm text-content-muted">{row.nameAr}</p>}
        </div>
      ),
    },
    { key: 'category', header: t('budget.category'), sortable: true },
    {
      key: 'allocatedAmount',
      header: t('budget.allocatedAmount'),
      sortable: true,
      render: (row) => <span className="font-medium">{row.allocatedAmount.toLocaleString()} SAR</span>,
    },
    {
      key: 'spentAmount',
      header: t('budget.spentAmount'),
      sortable: true,
      render: (row) => <span className={row.spentAmount > row.allocatedAmount ? 'text-danger font-medium' : ''}>{row.spentAmount.toLocaleString()} SAR</span>,
    },
    {
      key: 'status',
      header: t('budget.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={row.status === 'active' ? 'success' : row.status === 'exhausted' ? 'warning' : 'neutral'}
          label={t(`budget.statuses.${row.status}`)}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '100px',
      render: (row) => (
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setArchiveTarget({ type: 'budget', id: row._id, name: row.name }) }}>
          {t('budget.archive')}
        </Button>
      ),
    },
  ]

  return (
    <RequirePermission permission="projects.project.view">
      <PageLayout
        title={t('nav.projectCosts')}
        description={t('expense.description')}
        icon={<DollarSign className="h-5 w-5" />}
        actions={
          activeTab === 'expenses' ? (
            <RequirePermission permission="projects.project.create">
              <Button onClick={() => createExpense({ projectId: '', category: 'other', description: 'New Expense', amount: 0, expenseDate: new Date() })}>
                <Plus className="h-4 w-4 me-1" aria-hidden="true" />
                {t('expense.create')}
              </Button>
            </RequirePermission>
          ) : (
            <RequirePermission permission="projects.project.create">
              <Button onClick={() => createBudget({ projectId: '', name: 'New Budget', category: 'general', allocatedAmount: 0 })}>
                <Plus className="h-4 w-4 me-1" aria-hidden="true" />
                {t('budget.create')}
              </Button>
            </RequirePermission>
          )
        }
      >
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-content-muted">{t('expense.title')}</p>
            <p className="text-2xl font-semibold">{totalExpenses.toLocaleString()} SAR</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-content-muted">{t('stats.totalBudget')}</p>
            <p className="text-2xl font-semibold">{totalBudget.toLocaleString()} SAR</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-content-muted">{t('stats.spentBudget')}</p>
            <p className="text-2xl font-semibold">{totalSpent.toLocaleString()} SAR</p>
          </div>
        </div>

        <div className="flex gap-1 border-b border-border mb-4">
          {(['expenses', 'budgets'] as const).map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-content-muted hover:text-content'
              }`}
              onClick={() => { setActiveTab(tab); setPage(1); setSearch('') }}
            >
              {tab === 'expenses' ? t('expense.title') : t('budget.title')}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('filters.searchProjects')}
          />
        </div>

        <DataTable
          columns={activeTab === 'expenses' ? expenseColumns : budgetColumns}
          data={paginated}
          rowKey={(row) => row._id}
          loading={activeTab === 'expenses' ? expensesLoading : budgetsLoading}
          footer={
            <Pagination
              page={page}
              pageSize={pageSize}
              totalItems={items.length}
              onPageChange={setPage}
              pageSizeOptions={[5, 10, 25, 50]}
              onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
            />
          }
        />

        <Dialog
          open={!!archiveTarget}
          onOpenChange={(open) => { if (!open) setArchiveTarget(null) }}
          title={archiveTarget?.type === 'expense' ? t('expense.archive') : t('budget.archive')}
          footer={
            <FormActions
              submitLabel={archiveTarget?.type === 'expense' ? t('expense.archive') : t('budget.archive')}
              cancelLabel="Cancel"
              onCancel={() => setArchiveTarget(null)}
              onSubmit={() => {
                if (archiveTarget) {
                  if (archiveTarget.type === 'expense') {
                    archiveExpense(archiveTarget.id)
                  } else {
                    archiveBudget(archiveTarget.id)
                  }
                  setArchiveTarget(null)
                }
              }}
            />
          }
        >
          <p className="text-sm text-content-muted">
            {archiveTarget?.type === 'expense' ? t('expense.confirmArchive') : t('budget.confirmArchive')}
          </p>
        </Dialog>
      </PageLayout>
    </RequirePermission>
  )
}
