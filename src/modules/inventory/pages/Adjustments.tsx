import { useState, useMemo, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch'
import { Settings, Plus, CheckCircle, Play } from 'lucide-react'

import Button from '@/components/ui/Button'
import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import StatusBadge from '@/components/data-display/StatusBadge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useWarehouses } from '@/modules/inventory/hooks/useWarehouses'
import { StockAdjustmentForm } from '@/modules/inventory/forms/StockAdjustmentForm'

interface DevStockAdjustment {
  _id: string
  code: string
  warehouseId: string
  reason: string
  status: string
  notes: string | null
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

type AdjustmentInput = Record<string, unknown>

interface AdjustmentProvider {
  getAll(): DevStockAdjustment[]
  create(input: AdjustmentInput): DevStockAdjustment
  updateStatus(id: string, status: string): DevStockAdjustment | undefined
}

let providerPromise: Promise<AdjustmentProvider> | null = null

function getProvider(): Promise<AdjustmentProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/core/repositories/StockAdjustmentRepository')
      const repo = new mod.StockAdjustmentRepository()
      return {
        getAll: () => repo.findAll().map(r => r as unknown as DevStockAdjustment),
        create: (input) => repo.create(input as never) as unknown as DevStockAdjustment,
        updateStatus: (id, status) => { repo.update(id, { status } as never); return repo.findById(id) as unknown as DevStockAdjustment ?? undefined },
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): AdjustmentProvider {
  const KEY = 'erp_dev_stock_adjustments'
  const load = (): DevStockAdjustment[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  }
  const save = (data: DevStockAdjustment[]) => localStorage.setItem(KEY, JSON.stringify(data))
  const genId = () => Math.random().toString(36).substring(2, 15)
  const now = () => new Date().toISOString()
  return {
    getAll: () => load().filter(a => !a.isDeleted),
    create: (input) => {
      const data = load()
      const a: DevStockAdjustment = {
        _id: genId(),
        code: (input.code as string) || '',
        warehouseId: (input.warehouseId as string) || '',
        reason: (input.reason as string) || '',
        status: 'draft',
        notes: (input.notes as string) || null,
        isDeleted: false,
        deletedAt: null,
        createdAt: now(),
        updatedAt: now(),
      }
      data.push(a); save(data); return a
    },
    updateStatus: (id, status) => {
      const data = load(); const idx = data.findIndex(a => a._id === id)
      if (idx === -1) return undefined
      data[idx] = { ...data[idx], status, updatedAt: now() } as DevStockAdjustment
      save(data); return data[idx]
    },
  }
}

export default function Adjustments() {
  const { t } = useTranslation('inventory')
  const { warehouses } = useWarehouses()
  const [adjustments, setAdjustments] = useState<DevStockAdjustment[]>([])
  const [loading, setLoading] = useState(true)
  const { search, setSearch, debouncedSearch, page, setPage } = useDebouncedSearch()
  const [pageSize, setPageSize] = useState(10)
  const [formOpen, setFormOpen] = useState(false)

  const refresh = useCallback(() => {
    getProvider().then((p) => { setAdjustments(p.getAll()); setLoading(false) })
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const warehouseMap = useMemo(() => {
    const map = new Map<string, typeof warehouses[0]>()
    for (const w of warehouses) map.set(w._id, w)
    return map
  }, [warehouses])

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return adjustments
    const q = debouncedSearch.toLowerCase()
    return adjustments.filter((item) => {
      const warehouse = warehouseMap.get(item.warehouseId)
      return (
        item.code.toLowerCase().includes(q) ||
        item.reason.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q) ||
        (warehouse?.name ?? '').toLowerCase().includes(q) ||
        (warehouse?.code ?? '').toLowerCase().includes(q)
      )
    })
  }, [adjustments, debouncedSearch, warehouseMap])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statusTone = (status: string) => {
    switch (status) {
      case 'draft': return 'neutral' as const
      case 'pending': return 'warning' as const
      case 'approved': return 'info' as const
      case 'applied': return 'success' as const
      case 'cancelled': return 'neutral' as const
      default: return 'neutral' as const
    }
  }

  const columns: DataTableColumn<DevStockAdjustment>[] = [
    { key: 'code', header: t('stockAdjustment.code'), sortable: true, width: '120px' },
    {
      key: 'warehouseId',
      header: t('stockAdjustment.warehouse'),
      render: (row) => {
        const warehouse = warehouseMap.get(row.warehouseId)
        return <span className="text-sm">{warehouse?.name ?? row.warehouseId}</span>
      },
    },
    {
      key: 'reason',
      header: t('stockAdjustment.reason'),
      render: (row) => (
        <span className="text-sm text-content-muted truncate max-w-[200px] block">{row.reason}</span>
      ),
    },
    {
      key: 'status',
      header: t('stockAdjustment.status'),
      sortable: true,
      render: (row) => (
        <StatusBadge
          tone={statusTone(row.status)}
          label={t(`stockAdjustment.statusValues.${row.status}`)}
        />
      ),
    },
    {
      key: 'notes',
      header: t('stockAdjustment.notes'),
      render: (row) => (
        <span className="text-sm text-content-muted truncate max-w-[150px] block">
          {row.notes ?? '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '180px',
      render: (row) => (
        <div className="flex gap-1">
          {row.status === 'draft' && (
            <RequirePermission permission="inventory.adjustments.create">
              <Button variant="ghost" size="sm" onClick={(e) => {
                e.stopPropagation()
                getProvider().then((p) => { p.updateStatus(row._id, 'pending'); refresh() })
              }}>
                <CheckCircle className="h-3 w-3 me-1" />{t('stockAdjustment.submit')}
              </Button>
            </RequirePermission>
          )}
          {row.status === 'approved' && (
            <RequirePermission permission="inventory.adjustments.create">
              <Button variant="ghost" size="sm" onClick={(e) => {
                e.stopPropagation()
                getProvider().then((p) => { p.updateStatus(row._id, 'applied'); refresh() })
              }}>
                <Play className="h-3 w-3 me-1" />{t('stockAdjustment.apply')}
              </Button>
            </RequirePermission>
          )}
        </div>
      ),
    },
  ]

  return (
    <RequirePermission permission="inventory.adjustments.view">
      <PageLayout
        title={t('stockAdjustment.title')}
        description={t('stockAdjustment.description')}
        icon={<Settings className="h-5 w-5" />}
        actions={
          <RequirePermission permission="inventory.adjustments.create">
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 me-1" aria-hidden="true" />
              {t('stockAdjustment.create')}
            </Button>
          </RequirePermission>
        }
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('stockAdjustment.searchPlaceholder')}
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

        <StockAdjustmentForm
          open={formOpen}
          onOpenChange={setFormOpen}
          warehouses={warehouses.map((w) => ({ _id: w._id, name: w.name }))}
          onSubmit={(input) => {
            getProvider().then((p) => { p.create(input); refresh() })
          }}
        />
      </PageLayout>
    </RequirePermission>
  )
}
