import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, FileText, FileSpreadsheet, FileJson, FileDown } from 'lucide-react'

import Button from '@/components/ui/Button'
import ProgressBar from '@/components/ui/ProgressBar'
import { cn } from '@/lib/cn'
import type { ExportFileType } from '@/types/data-management'

export interface ExportOptionsProps {
  availableSchemas: string[]
  exporting: boolean
  progress: { phase: string; currentStep?: string } | null
  onExport: (options: {
    fileType: ExportFileType
    schemas: string[]
    filename: string
    title?: string
  }) => void
}

const FILE_TYPES: { value: ExportFileType; icon: typeof FileText; labelKey: string }[] = [
  { value: 'csv', icon: FileText, labelKey: 'export.csv' },
  { value: 'excel', icon: FileSpreadsheet, labelKey: 'export.excel' },
  { value: 'json', icon: FileJson, labelKey: 'export.json' },
  { value: 'pdf', icon: FileDown, labelKey: 'export.pdf' },
]

export default function ExportOptions({
  availableSchemas,
  exporting,
  progress,
  onExport,
}: ExportOptionsProps) {
  const { t } = useTranslation('ui')
  const [selectedType, setSelectedType] = useState<ExportFileType>('csv')
  const [selectedSchemas, setSelectedSchemas] = useState<string[]>([])
  const [filename, setFilename] = useState('al-ansari-export')
  const [selectAll, setSelectAll] = useState(true)

  const toggleSchema = (schema: string) => {
    setSelectedSchemas((prev) =>
      prev.includes(schema) ? prev.filter((s) => s !== schema) : [...prev, schema],
    )
    setSelectAll(false)
  }

  const toggleAll = () => {
    if (selectAll) {
      setSelectedSchemas([])
      setSelectAll(false)
    } else {
      setSelectedSchemas([...availableSchemas])
      setSelectAll(true)
    }
  }

  const handleExport = () => {
    onExport({
      fileType: selectedType,
      schemas: selectAll ? availableSchemas : selectedSchemas,
      filename,
      title: selectedType === 'pdf' ? filename : undefined,
    })
  }

  return (
    <div className="space-y-4">
      {/* File Type */}
      <div>
        <label className="block text-sm font-medium text-content mb-2">{t('export.format')}</label>
        <div className="grid grid-cols-2 gap-2">
          {FILE_TYPES.map(({ value, icon: Icon, labelKey }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSelectedType(value)}
              className={cn(
                'flex items-center gap-2 rounded-md border p-3 text-sm transition-colors',
                selectedType === value
                  ? 'border-primary bg-primary-subtle text-primary'
                  : 'border-border bg-surface hover:border-primary/40 text-content-muted',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {t(labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Filename */}
      <div>
        <label className="block text-sm font-medium text-content mb-1.5">{t('export.filename')}</label>
        <input
          type="text"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-content focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Schemas */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-content">{t('export.schemas')}</label>
          <button type="button" onClick={toggleAll} className="text-xs text-primary hover:underline">
            {selectAll ? t('export.deselectAll') : t('export.selectAll')}
          </button>
        </div>
        <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-border p-2">
          {availableSchemas.map((schema) => (
            <label
              key={schema}
              className="flex items-center gap-2 rounded px-2 py-1 text-sm text-content hover:bg-surface-sunken cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectAll || selectedSchemas.includes(schema)}
                onChange={() => toggleSchema(schema)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              {schema}
            </label>
          ))}
        </div>
      </div>

      {/* Progress */}
      {progress && (
        <ProgressBar
          value={progress.phase === 'complete' || progress.phase === 'error' ? 100 : progress.phase === 'exporting' ? 60 : 20}
          size="sm"
          showLabel
          color={progress.phase === 'error' ? 'danger' : 'primary'}
        />
      )}

      {/* Export Button */}
      <div className="flex justify-end pt-2 border-t border-border">
        <Button
          onClick={handleExport}
          loading={exporting}
          disabled={exporting || (!selectAll && selectedSchemas.length === 0) || !filename.trim()}
        >
          <Download className="h-4 w-4 me-1" aria-hidden="true" />
          {t('export.execute')}
        </Button>
      </div>
    </div>
  )
}
