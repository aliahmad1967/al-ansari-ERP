import { useState, useMemo, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Box } from 'lucide-react'

import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useProducts } from '@/modules/inventory/hooks/useProducts'
import { useWarehouses } from '@/modules/inventory/hooks/useWarehouses'

interface DevStockBalance {
  _id: string
  productId: string
  warehouseId: string
  locationId: string | null
  quantity: number
  reservedQuantity: number
  unitCost: number
  totalCost: number
  lastMovementAt: string | null
  createdAt: string
  updatedAt: string
}

interface StockBalanceProvider {
  getAll(): DevStockBalance[]
}

let providerPromise: Promise<StockBalanceProvider> | null = null

function getProvider(): Promise<StockBalanceProvider> {
  if (providerPromise) return providerPromise
  providerPromise = (async () => {
    try {
      const mod = await import('@/modules/inventory/services/StockService')
      const svc = new mod.StockService()
      return {
        getAll: () => svc.findStockBalances().map(r => r as unknown as DevStockBalance),
      }
    } catch {
      return getLocalStorageProvider()
    }
  })()
  return providerPromise
}

function getLocalStorageProvider(): StockBalanceProvider {
  const KEY = 'erp_dev_stock_balances'
  const load = (): DevStockBalance[] => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  }
  return {
    getAll: () => load(),
  }
}

export default function Stock() {
  const { t } = useTranslation('inventory')
  const { products } = useProducts()
  const { warehouses } = useWarehouses()
  const [balances, setBalances] = useState<DevStockBalance[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const refresh = useCallback(() => {
    getProvider().then((p) => { setBalances(p.getAll()); setLoading(false) })
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const productMap = useMemo(() => {
    const map = new Map<string, typeof products[0]>()
    for (const p of products) map.set(p._id, p)
    return map
  }, [products])

  const warehouseMap = useMemo(() => {
    const map = new Map<string, typeof warehouses[0]>()
    for (const w of warehouses) map.set(w._id, w)
    return map
  }, [warehouses])

  const filtered = useMemo(() => {
    if (!search.trim()) return balances
    const q = search.toLowerCase()
    return balances.filter((item) => {
      const product = productMap.get(item.productId)
      const warehouse = warehouseMap.get(item.warehouseId)
      return (
        (product?.name ?? '').toLowerCase().includes(q) ||
        (product?.sku ?? '').toLowerCase().includes(q) ||
        (warehouse?.name ?? '').toLowerCase().includes(q) ||
        (warehouse?.code ?? '').toLowerCase().includes(q)
      )
    })
  }, [balances, search, productMap, warehouseMap])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const formatMoney = (value: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)

  const columns: DataTableColumn<DevStockBalance>[] = [
    {
      key: 'productId',
      header: t('stock.product'),
      sortable: true,
      render: (row) => {
        const product = productMap.get(row.productId)
        return (
          <div>
            <p className="font-medium text-content text-sm">{product?.name ?? row.productId}</p>
            {product?.sku && <p className="text-xs text-content-muted">{product.sku}</p>}
          </div>
        )
      },
    },
    {
      key: 'warehouseId',
      header: t('stock.warehouse'),
      sortable: true,
      render: (row) => {
        const warehouse = warehouseMap.get(row.warehouseId)
        return (
          <div>
            <p className="font-medium text-content text-sm">{warehouse?.name ?? row.warehouseId}</p>
            {warehouse?.code && <p className="text-xs text-content-muted">{warehouse.code}</p>}
          </div>
        )
      },
    },
    { key: 'quantity', header: t('stock.quantity'), sortable: true },
    { key: 'reservedQuantity', header: t('stock.reservedQuantity'), sortable: true },
    {
      key: 'unitCost',
      header: t('stock.unitCost'),
      sortable: true,
      render: (row) => <span className="text-sm font-mono">{formatMoney(row.unitCost)}</span>,
    },
    {
      key: 'totalCost',
      header: t('stock.totalValue'),
      sortable: true,
      render: (row) => <span className="text-sm font-mono font-semibold">{formatMoney(row.totalCost)}</span>,
    },
    {
      key: 'lastMovementAt',
      header: t('stock.lastMovementAt'),
      render: (row) => (
        <span className="text-sm text-content-muted">
          {row.lastMovementAt ? new Date(row.lastMovementAt).toLocaleDateString() : '-'}
        </span>
      ),
    },
  ]

  return (
    <RequirePermission permission="inventory.stock.view">
      <PageLayout
        title={t('stock.title')}
        description={t('stock.description')}
        icon={<Box className="h-5 w-5" />}
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('stock.searchPlaceholder')}
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
