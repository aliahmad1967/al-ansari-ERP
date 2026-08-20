import { useState, useMemo, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { FolderTree, Plus } from 'lucide-react'

import Button from '@/components/ui/Button'
import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import Dialog from '@/components/ui/Dialog'
import FormActions from '@/components/forms/FormActions'
import FormField from '@/components/forms/FormField'
import Input from '@/components/ui/Input'
import { RequirePermission } from '@/components/auth/RequirePermission'

interface DevCategory {
  _id: string
  code: string
  name: string
  nameAr: string | null
  description: string | null
  parentId: string | null
  sortOrder: number
  isActive: boolean
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

type CategoryInput = Record<string, unknown>

interface CategoryProvider {
  getAll(): DevCategory[]
  create(input: CategoryInput): DevCategory
  update(id: string, changes: CategoryInput): DevCategory | undefined
  archive(id: string): boolean
}

let providerPromise: Promise<CategoryProvider> | null = null

function getProvider(): Promise<CategoryProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/core/repositories/CategoryRepository')
      const repo = new mod.CategoryRepository()
      return {
        getAll: () => repo.findAll().map(r => r as unknown as DevCategory),
        create: (input) => repo.create(input as never) as unknown as DevCategory,
        update: (id, changes) => { repo.update(id, changes as never); return repo.findById(id) as unknown as DevCategory ?? undefined },
        archive: (id) => repo.softDelete(id),
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): CategoryProvider {
  const KEY = 'erp_dev_categories'
  const load = (): DevCategory[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  }
  const save = (data: DevCategory[]) => localStorage.setItem(KEY, JSON.stringify(data))
  const genId = () => Math.random().toString(36).substring(2, 15)
  const now = () => new Date().toISOString()
  return {
    getAll: () => load().filter(c => !c.isDeleted),
    create: (input) => {
      const data = load()
      const c: DevCategory = {
        _id: genId(),
        code: (input.code as string) || '',
        name: (input.name as string) || '',
        nameAr: (input.nameAr as string) || null,
        description: (input.description as string) || null,
        parentId: (input.parentId as string) || null,
        sortOrder: (input.sortOrder as number) || 0,
        isActive: true,
        isDeleted: false,
        deletedAt: null,
        createdAt: now(),
        updatedAt: now(),
      }
      data.push(c); save(data); return c
    },
    update: (id, changes) => {
      const data = load(); const idx = data.findIndex(c => c._id === id)
      if (idx === -1) return undefined
      data[idx] = { ...data[idx], ...changes, updatedAt: now() } as DevCategory
      save(data); return data[idx]
    },
    archive: (id) => {
      const data = load(); const c = data.find(x => x._id === id)
      if (!c) return false; c.isDeleted = true; c.deletedAt = now(); save(data); return true
    },
  }
}

export default function Categories() {
  const { t } = useTranslation('inventory')
  const [categories, setCategories] = useState<DevCategory[]>([])
  const [loading, setLoading] = useState(true)
  const { search, setSearch, debouncedSearch, page, setPage } = useDebouncedSearch()
  const [pageSize, setPageSize] = useState(10)
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<DevCategory | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<DevCategory | null>(null)
  const [formCode, setFormCode] = useState('')
  const [formName, setFormName] = useState('')
  const [formNameAr, setFormNameAr] = useState('')
  const [formDescription, setFormDescription] = useState('')

  const refresh = useCallback(() => {
    getProvider().then((p) => { setCategories(p.getAll()); setLoading(false) })
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return categories
    const q = debouncedSearch.toLowerCase()
    return categories.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.nameAr ?? '').includes(debouncedSearch) ||
        item.code.toLowerCase().includes(q),
    )
  }, [categories, debouncedSearch])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleOpenForm = (item: DevCategory | null) => {
    setEditItem(item)
    setFormCode(item?.code ?? '')
    setFormName(item?.name ?? '')
    setFormNameAr(item?.nameAr ?? '')
    setFormDescription(item?.description ?? '')
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    const provider = await getProvider()
    if (editItem) {
      provider.update(editItem._id, { code: formCode, name: formName, nameAr: formNameAr || undefined, description: formDescription || undefined })
    } else {
      provider.create({ code: formCode, name: formName, nameAr: formNameAr || undefined, description: formDescription || undefined })
    }
    setFormOpen(false)
    refresh()
  }

  const columns: DataTableColumn<DevCategory>[] = [
    { key: 'code', header: t('category.code'), sortable: true, width: '120px' },
    {
      key: 'name',
      header: t('category.name'),
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
      header: t('category.description'),
      render: (row) => (
        <span className="text-sm text-content-muted truncate max-w-[200px] block">
          {row.description ?? '-'}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: t('category.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={row.isActive ? 'success' : 'neutral'}
          label={row.isActive ? t('category.active') : t('category.inactive')}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '120px',
      render: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenForm(row) }}>
            {t('category.edit')}
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setArchiveTarget(row) }}>
            {t('category.archive')}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <RequirePermission permission="inventory.categories.view">
      <PageLayout
        title={t('category.title')}
        description={t('category.description')}
        icon={<FolderTree className="h-5 w-5" />}
        actions={
          <RequirePermission permission="inventory.categories.create">
            <Button onClick={() => handleOpenForm(null)}>
              <Plus className="h-4 w-4 me-1" aria-hidden="true" />
              {t('category.create')}
            </Button>
          </RequirePermission>
        }
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('category.searchPlaceholder')}
          />
        </div>

        <DataTable
          columns={columns}
          data={paginated}
          rowKey={(row) => row._id}
          loading={loading}
          onRowClick={(row) => handleOpenForm(row)}
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
          open={formOpen}
          onOpenChange={setFormOpen}
          title={editItem ? t('category.edit') : t('category.create')}
          footer={
            <FormActions
              submitLabel={editItem ? t('category.edit') : t('category.create')}
              onCancel={() => setFormOpen(false)}
              onSubmit={handleSubmit}
            />
          }
        >
          <div className="grid grid-cols-1 gap-4">
            <FormField label={t('category.code')} required>
              <Input value={formCode} onChange={(e) => setFormCode(e.target.value)} disabled={!!editItem} />
            </FormField>
            <FormField label={t('category.name')} required>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} />
            </FormField>
            <FormField label={t('category.nameAr')}>
              <Input value={formNameAr} onChange={(e) => setFormNameAr(e.target.value)} dir="rtl" />
            </FormField>
            <FormField label={t('category.description')}>
              <Input value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
            </FormField>
          </div>
        </Dialog>

        <Dialog
          open={!!archiveTarget}
          onOpenChange={(open) => { if (!open) setArchiveTarget(null) }}
          title={t('category.archive')}
          footer={
            <FormActions
              submitLabel={t('category.archive')}
              onCancel={() => setArchiveTarget(null)}
              onSubmit={async () => {
                if (archiveTarget) {
                  const provider = await getProvider()
                  provider.archive(archiveTarget._id)
                  setArchiveTarget(null)
                  refresh()
                }
              }}
            />
          }
        >
          <p className="text-sm text-content-muted">{t('category.confirmArchive')}</p>
        </Dialog>
      </PageLayout>
    </RequirePermission>
  )
}
