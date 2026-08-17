import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowUpDown } from 'lucide-react'

import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { useStockMovements } from '@/modules/inventory/hooks/useStockMovements'
import { useProducts } from '@/modules/inventory/hooks/useProducts'
import { useWarehouses } from '@/modules/inventory/hooks/useWarehouses'

export default function StockMovements() {
  const { t } = useTranslation('inventory')
  const { movements, loading } = useStockMovements()
  const { products } = useProducts()
  const { warehouses } = useWarehouses()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

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
    if (!search.trim()) return movements
    const q = search.toLowerCase()
    return movements.filter((item) => {
      const product = productMap.get(item.productId)
      const warehouse = warehouseMap.get(item.warehouseId)
      return (
        item.type.toLowerCase().includes(q) ||
        (product?.name ?? '').toLowerCase().includes(q) ||
        (product?.sku ?? '').toLowerCase().includes(q) ||
        (warehouse?.name ?? '').toLowerCase().includes(q) ||
        (item.referenceNumber ?? '').toLowerCase().includes(q)
      )
    })
  }, [movements, search, productMap, warehouseMap])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const formatMoney = (value: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)

  const columns: DataTableColumn<typeof movements[0]>[] = [
    {
      key: 'createdAt',
      header: t('movement.date'),
      sortable: true,
      render: (row) => (
        <span className="text-sm">{new Date(row.createdAt).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'type',
      header: t('movement.type'),
      sortable: true,
      render: (row) => (
        <span className="text-sm font-medium">{t(`movement.typeValues.${row.type}`)}</span>
      ),
    },
    {
      key: 'productId',
      header: t('movement.product'),
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
      header: t('movement.warehouse'),
      render: (row) => {
        const warehouse = warehouseMap.get(row.warehouseId)
        return <span className="text-sm">{warehouse?.name ?? row.warehouseId}</span>
      },
    },
    { key: 'quantity', header: t('movement.quantity'), sortable: true },
    {
      key: 'unitCost',
      header: t('movement.unitCost'),
      sortable: true,
      render: (row) => <span className="text-sm font-mono">{formatMoney(row.unitCost)}</span>,
    },
    {
      key: 'totalCost',
      header: t('movement.totalCost'),
      sortable: true,
      render: (row) => <span className="text-sm font-mono font-semibold">{formatMoney(row.totalCost)}</span>,
    },
    {
      key: 'referenceNumber',
      header: t('movement.referenceNumber'),
      render: (row) => (
        <span className="text-sm text-content-muted">{row.referenceNumber ?? '-'}</span>
      ),
    },
  ]

  return (
    <RequirePermission permission="inventory.movements.view">
      <PageLayout
        title={t('movement.title')}
        description={t('movement.description')}
        icon={<ArrowUpDown className="h-5 w-5" />}
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('movement.searchPlaceholder')}
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
