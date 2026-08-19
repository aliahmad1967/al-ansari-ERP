import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload } from 'lucide-react'

import Button from '@/components/ui/Button'
import ProgressBar from '@/components/ui/ProgressBar'
import { cn } from '@/lib/cn'
import type { ImportFileType, ImportPreview, ImportValidationIssue } from '@/types/data-management'

export interface ImportWizardProps {
  preview: ImportPreview | null
  importing: boolean
  progress: { phase: string; currentStep?: string } | null
  validationIssues: ImportValidationIssue[]
  availableSchemas: string[]
  onFileSelected: (file: File, fileType: ImportFileType, targetSchema: string) => void
  onExecute: (dryRun?: boolean) => void
  onClear: () => void
}

function detectFileType(file: File): ImportFileType {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext === 'xlsx' || ext === 'xls') return 'excel'
  if (ext === 'json') return 'json'
  return 'csv'
}

export default function ImportWizard({
  preview,
  importing,
  progress,
  validationIssues,
  availableSchemas,
  onFileSelected,
  onExecute,
  onClear,
}: ImportWizardProps) {
  const { t } = useTranslation('ui')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [targetSchema, setTargetSchema] = useState(availableSchemas[0] ?? '')
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback(
    (file: File) => {
      const fileType = detectFileType(file)
      setSelectedFile(file)
      onFileSelected(file, fileType, targetSchema)
    },
    [targetSchema, onFileSelected],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const errorCount = validationIssues.filter((i) => i.severity === 'error').length
  const warningCount = validationIssues.filter((i) => i.severity === 'warning').length

  return (
    <div className="space-y-4">
      {/* Step 1: Schema + File */}
      <div>
        <label className="block text-sm font-medium text-content mb-1.5">
          {t('import.targetSchema')}
        </label>
        <select
          value={targetSchema}
          onChange={(e) => setTargetSchema(e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-content focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {availableSchemas.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer',
          dragOver
            ? 'border-primary bg-primary-subtle'
            : 'border-border hover:border-primary/40 hover:bg-surface-sunken',
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-8 w-8 text-content-muted mb-2" aria-hidden="true" />
        <p className="text-sm text-content-muted">
          {selectedFile ? selectedFile.name : t('import.dropOrClick')}
        </p>
        <p className="text-xs text-content-subtle mt-1">
          {t('import.acceptedFormats')}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />
      </div>

      {/* Step 2: Preview */}
      {preview && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-content">
              {t('import.preview')} ({preview.totalRows} {t('import.rows')})
            </h4>
            <Button size="xs" variant="ghost" onClick={onClear}>
              {t('import.clear')}
            </Button>
          </div>

          {preview.detectedMappings.length > 0 && (
            <div className="rounded-md bg-surface-sunken p-3">
              <p className="text-xs font-medium text-content-muted mb-2">{t('import.detectedMappings')}</p>
              <div className="flex flex-wrap gap-1.5">
                {preview.detectedMappings.map((m) => (
                  <span key={m.targetField} className="inline-flex items-center rounded bg-primary-subtle px-2 py-0.5 text-xs text-primary">
                    {m.sourceColumn} → {m.targetField}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Validation Issues */}
          {(errorCount > 0 || warningCount > 0) && (
            <div className="rounded-md bg-surface-sunken p-3 space-y-1">
              {errorCount > 0 && (
                <p className="text-xs text-danger font-medium">
                  {t('import.errors', { count: errorCount })}
                </p>
              )}
              {warningCount > 0 && (
                <p className="text-xs text-warning font-medium">
                  {t('import.warnings', { count: warningCount })}
                </p>
              )}
              {validationIssues.slice(0, 5).map((issue, i) => (
                <p key={i} className={cn(
                  'text-xs',
                  issue.severity === 'error' ? 'text-danger' : 'text-warning',
                )}>
                  {t('import.rowLabel', { row: issue.row })}: {issue.field} — {issue.message}
                </p>
              ))}
              {validationIssues.length > 5 && (
                <p className="text-xs text-content-muted">
                  {t('import.moreIssues', { count: validationIssues.length - 5 })}
                </p>
              )}
            </div>
          )}

          {/* Progress */}
          {progress && (
            <ProgressBar
              value={progress.phase === 'complete' || progress.phase === 'error' ? 100 : 50}
              size="sm"
              showLabel
              color={progress.phase === 'error' ? 'danger' : 'primary'}
            />
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
        {selectedFile && !importing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExecute(true)}
            disabled={errorCount > 0}
          >
            {t('import.validateOnly')}
          </Button>
        )}
        {selectedFile && (
          <Button
            size="sm"
            onClick={() => onExecute(false)}
            loading={importing}
            disabled={importing || errorCount > 0}
          >
            <Upload className="h-4 w-4 me-1" aria-hidden="true" />
            {t('import.execute')}
          </Button>
        )}
      </div>
    </div>
  )
}
