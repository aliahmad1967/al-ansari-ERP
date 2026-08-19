import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { Database, Download, Trash2 } from 'lucide-react'

import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import EmptyState from '@/components/ui/EmptyState'
import { useBackup } from '@/modules/data-management/hooks/useBackup'
import { formatBytes } from '@/lib/format'

export interface BackupListProps {
  onRestore?: (backupId: string) => void
}

export default function BackupList({ onRestore }: BackupListProps) {
  const { t } = useTranslation('ui')
  const { backups, loading, createBackup, deleteBackup, restoreBackup } = useBackup()
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [restoreTarget, setRestoreTarget] = useState<string | null>(null)

  const sorted = useMemo(
    () => [...backups].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [backups],
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-content">{t('backupList.title')}</h3>
        <Button size="sm" onClick={() => createBackup()} loading={loading}>
          <Database className="h-4 w-4 me-1" aria-hidden="true" />
          {t('backupList.create')}
        </Button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState message={t('backupList.empty')} />
      ) : (
        <div className="space-y-2">
          {sorted.map((backup) => (
            <div
              key={backup.id}
              className="flex items-center justify-between rounded-lg border border-border bg-surface-raised p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-content">{backup.filename}</p>
                <p className="text-xs text-content-muted">
                  {format(new Date(backup.createdAt), 'PPP p')}
                  {backup.sizeBytes > 0 && ` · ${formatBytes(backup.sizeBytes)}`}
                  {backup.description && ` · ${backup.description}`}
                </p>
              </div>
              <div className="ms-3 flex items-center gap-1">
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    setRestoreTarget(backup.id)
                  }}
                  title={t('backupList.restore')}
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => setDeleteTarget(backup.id)}
                  title={t('backupList.delete')}
                >
                  <Trash2 className="h-3.5 w-3.5 text-danger" aria-hidden="true" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title={t('backupList.confirmDelete')}
        message={t('backupList.confirmDeleteMessage')}
        onConfirm={async () => {
          if (deleteTarget) {
            deleteBackup(deleteTarget)
            setDeleteTarget(null)
          }
        }}
      />

      <ConfirmDialog
        open={!!restoreTarget}
        onOpenChange={(open) => { if (!open) setRestoreTarget(null) }}
        title={t('backupList.confirmRestore')}
        message={t('backupList.confirmRestoreMessage')}
        variant="primary"
        onConfirm={async () => {
          if (restoreTarget) {
            await restoreBackup(restoreTarget)
            setRestoreTarget(null)
            onRestore?.(restoreTarget)
          }
        }}
      />
    </div>
  )
}
