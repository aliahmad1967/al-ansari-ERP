import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Key } from 'lucide-react'

import PageLayout from '@/components/layout/PageLayout'
import { DataTable, type DataTableColumn } from '@/components/data-display/DataTable'
import Badge from '@/components/ui/Badge'
import SearchInput from '@/components/forms/SearchInput'
import Pagination from '@/components/ui/Pagination'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { usePermissionList } from '@/modules/organization/hooks/usePermissionList'
import type { Permission } from '@/core/models/Permission'

export default function PermissionsPage() {
  const { t } = useTranslation('organization')
  const { items: permissions, loading } = usePermissionList()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filtered = useMemo(() => {
    if (!search.trim()) return permissions
    const q = search.toLowerCase()
    return permissions.filter(
      (item) =>
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.module.toLowerCase().includes(q),
    )
  }, [permissions, search])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const actionTone = (action: string) => {
    switch (action) {
      case 'view': return 'info' as const
      case 'create': return 'success' as const
      case 'update': return 'warning' as const
      case 'delete': return 'danger' as const
      default: return 'neutral' as const
    }
  }

  const columns: DataTableColumn<Permission>[] = [
    { key: 'code', header: t('permission.code'), sortable: true },
    { key: 'module', header: t('permission.module'), sortable: true },
    { key: 'resource', header: t('permission.resource'), sortable: true },
    {
      key: 'action',
      header: t('permission.action'),
      sortable: true,
      render: (row) => (
        <Badge variant={actionTone(row.action)} fill="soft">{row.action}</Badge>
      ),
    },
  ]

  return (
    <RequirePermission permission="organization.permission.view">
      <PageLayout
        title={t('permission.title')}
        description={t('permission.description')}
        icon={<Key className="h-5 w-5" />}
      >
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            onClear={() => { setSearch(''); setPage(1) }}
            placeholder={t('filters.search')}
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
              pageSizeOptions={[10, 25, 50, 100]}
              onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
            />
          }
        />
      </PageLayout>
    </RequirePermission>
  )
}
