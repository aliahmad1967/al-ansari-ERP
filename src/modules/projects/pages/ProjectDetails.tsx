import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Users, CheckCircle2, Clock, DollarSign } from 'lucide-react'

import Button from '@/components/ui/Button'
import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import Dialog from '@/components/ui/Dialog'
import FormActions from '@/components/forms/FormActions'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useProjects } from '@/modules/projects/hooks/useProjects'
import { useTasks } from '@/modules/projects/hooks/useTasks'
import { useMilestones } from '@/modules/projects/hooks/useMilestones'
import { TaskStatus } from '@/core/models/TaskStatus'
import { MilestoneStatus } from '@/core/models/MilestoneStatus'

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation('projects')
  const { t: tCommon } = useTranslation('common')
  const { items: projects, archive } = useProjects()
  const { items: allTasks, create: createTask, archive: archiveTask } = useTasks()
  const { items: allMilestones } = useMilestones()

  const project = projects.find((p) => p._id === id)
  const tasks = useMemo(() => allTasks.filter((t) => t.projectId === id), [allTasks, id])
  const milestones = useMemo(() => allMilestones.filter((m) => m.projectId === id), [allMilestones, id])

  const [activeTab, setActiveTab] = useState<'tasks' | 'milestones' | 'overview'>('overview')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [archiveTarget, setArchiveTarget] = useState<{ type: string; id: string; name: string } | null>(null)

  const filteredTasks = useMemo(() => {
    if (!search.trim()) return tasks
    const q = search.toLowerCase()
    return tasks.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.taskCode.toLowerCase().includes(q) ||
        (item.titleAr ?? '').includes(search),
    )
  }, [tasks, search])

  const paginatedTasks = filteredTasks.slice((page - 1) * pageSize, page * pageSize)

  if (!project) {
    return (
      <PageLayout title={tCommon('loading')} icon={<ArrowLeft className="h-5 w-5" />}>
        <p className="text-content-muted">{tCommon('loading')}</p>
      </PageLayout>
    )
  }

  const completedTasks = tasks.filter((t) => t.status === TaskStatus.Done).length
  const completedMilestones = milestones.filter((m) => m.status === MilestoneStatus.Achieved).length

  const taskStatusTone = (status: string) => {
    switch (status) {
      case TaskStatus.Done: return 'success'
      case TaskStatus.InProgress: return 'primary'
      case TaskStatus.InReview: return 'info'
      case TaskStatus.Cancelled: return 'danger'
      default: return 'neutral'
    }
  }

  const taskColumns: DataTableColumn<(typeof tasks)[0]>[] = [
    { key: 'taskCode', header: t('task.code'), sortable: true, width: '100px' },
    {
      key: 'title',
      header: t('task.title_label'),
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-content">{row.title}</p>
          {row.titleAr && <p className="text-sm text-content-muted">{row.titleAr}</p>}
        </div>
      ),
    },
    {
      key: 'status',
      header: t('task.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={taskStatusTone(row.status) as 'success' | 'primary' | 'info' | 'danger' | 'neutral'}
          label={t(`task.statuses.${row.status}`)}
        />
      ),
    },
    {
      key: 'priority',
      header: t('task.priority'),
      sortable: true,
      render: (row) => <span className="text-sm text-content-muted">{t(`task.priorities.${row.priority}`)}</span>,
    },
    {
      key: 'dueDate',
      header: t('task.dueDate'),
      sortable: true,
      render: (row) => row.dueDate ? new Date(row.dueDate).toLocaleDateString() : '-',
    },
    {
      key: 'loggedHours',
      header: t('task.loggedHours'),
      render: (row) => <span className="text-sm text-content-muted">{row.loggedHours}h / {row.estimatedHours}h</span>,
    },
  ]

  return (
    <RequirePermission permission="projects.project.view">
      <PageLayout
        title={project.nameAr || project.name}
        description={project.description || undefined}
        icon={<ArrowLeft className="h-5 w-5" />}
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate('/projects')}>
              <ArrowLeft className="h-4 w-4 me-1" />
              {t('project.title')}
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 text-sm text-content-muted mb-1">
              <CheckCircle2 className="h-4 w-4" /> {t('stats.totalTasks')}
            </div>
            <p className="text-2xl font-semibold">{tasks.length}</p>
            <p className="text-xs text-content-muted">{completedTasks} {t('stats.completedTasks').toLowerCase()}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 text-sm text-content-muted mb-1">
              <Users className="h-4 w-4" /> {t('stats.totalMembers')}
            </div>
            <p className="text-2xl font-semibold">{milestones.length}</p>
            <p className="text-xs text-content-muted">{completedMilestones} {t('milestone.statuses.achieved')}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 text-sm text-content-muted mb-1">
              <Clock className="h-4 w-4" /> {t('stats.totalHours')}
            </div>
            <p className="text-2xl font-semibold">{project.progress}%</p>
            <p className="text-xs text-content-muted">{t('stats.progress')}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 text-sm text-content-muted mb-1">
              <DollarSign className="h-4 w-4" /> {t('stats.totalBudget')}
            </div>
            <p className="text-2xl font-semibold">{project.budget > 0 ? project.budget.toLocaleString() : '-'}</p>
            <p className="text-xs text-content-muted">{t('stats.spentBudget')}: {project.spentBudget.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex gap-1 border-b border-border mb-4">
          {(['overview', 'tasks', 'milestones'] as const).map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-content-muted hover:text-content'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' ? t('project.view') : tab === 'tasks' ? t('task.title') : t('milestone.title')}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold mb-4">{t('project.name')}</h3>
              <dl className="grid grid-cols-2 gap-4">
                <div><dt className="text-sm text-content-muted">{t('project.code')}</dt><dd className="font-medium">{project.projectCode}</dd></div>
                <div><dt className="text-sm text-content-muted">{t('project.status')}</dt><dd><StatusBadge tone={project.status === 'active' ? 'success' : 'neutral'} label={t(`project.statuses.${project.status}`)} /></dd></div>
                <div><dt className="text-sm text-content-muted">{t('project.priority')}</dt><dd>{t(`project.priorities.${project.priority}`)}</dd></div>
                <div><dt className="text-sm text-content-muted">{t('project.startDate')}</dt><dd>{project.startDate ? new Date(project.startDate).toLocaleDateString() : '-'}</dd></div>
                <div><dt className="text-sm text-content-muted">{t('project.endDate')}</dt><dd>{project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}</dd></div>
                <div><dt className="text-sm text-content-muted">{t('project.budget')}</dt><dd>{project.budget > 0 ? `${project.budget.toLocaleString()} SAR` : '-'}</dd></div>
              </dl>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <SearchInput
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                onClear={() => { setSearch(''); setPage(1) }}
                placeholder={t('filters.searchTasks')}
              />
              <RequirePermission permission="projects.task.create">
                <Button onClick={() => createTask({ projectId: id!, taskCode: `TSK-${Date.now()}`, title: 'New Task' })}>
                  <Plus className="h-4 w-4 me-1" />
                  {t('task.create')}
                </Button>
              </RequirePermission>
            </div>
            <DataTable
              columns={taskColumns}
              data={paginatedTasks}
              rowKey={(row) => row._id}
              footer={
                <Pagination
                  page={page}
                  pageSize={pageSize}
                  totalItems={filteredTasks.length}
                  onPageChange={setPage}
                  pageSizeOptions={[5, 10, 25, 50]}
                  onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
                />
              }
            />
          </div>
        )}

        {activeTab === 'milestones' && (
          <div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {milestones.map((m) => (
                <div key={m._id} className="rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{m.nameAr || m.name}</h4>
                    <StatusBadge
                      tone={m.status === 'achieved' ? 'success' : m.status === 'missed' ? 'danger' : 'neutral'}
                      label={t(`milestone.statuses.${m.status}`)}
                    />
                  </div>
                  <p className="text-sm text-content-muted mb-2">
                    {t('milestone.dueDate')}: {new Date(m.dueDate).toLocaleDateString()}
                  </p>
                  {m.description && <p className="text-sm text-content-muted">{m.description}</p>}
                </div>
              ))}
              {milestones.length === 0 && (
                <p className="text-content-muted col-span-full text-center py-8">{t('empty.milestones')}</p>
              )}
            </div>
          </div>
        )}

        <Dialog
          open={!!archiveTarget}
          onOpenChange={(open) => { if (!open) setArchiveTarget(null) }}
          title={archiveTarget?.type === 'project' ? t('project.archive') : t('task.archive')}
          footer={
            <FormActions
              submitLabel={tCommon('ui.delete')}
              cancelLabel="Cancel"
              onCancel={() => setArchiveTarget(null)}
              onSubmit={() => {
                if (archiveTarget) {
                  if (archiveTarget.type === 'project') {
                    archive(archiveTarget.id)
                    navigate('/projects')
                  } else {
                    archiveTask(archiveTarget.id)
                  }
                  setArchiveTarget(null)
                }
              }}
            />
          }
        >
          <p className="text-sm text-content-muted">{t('task.confirmArchive')}</p>
        </Dialog>
      </PageLayout>
    </RequirePermission>
  )
}
