import { useTranslation } from 'react-i18next'
import { Download, FileSpreadsheet, FileText, Printer, Save } from 'lucide-react'
import Button from '@/components/ui/Button'
import type { ReportDataPoint } from '../types/report.types'

interface ExportColumn {
  key: string
  header: string
}

interface ReportExportBarProps {
  data: ReportDataPoint[]
  columns: ExportColumn[]
  filename: string
  title?: string
  onExportCsv?: () => void
  onExportExcel?: () => void
  onExportPdf?: () => void
  onPrint?: () => void
  onSave?: () => void
}

export function ReportExportBar({
  data,
  columns,
  filename,
  title,
  onSave,
}: ReportExportBarProps) {
  const { t } = useTranslation('reports')

  const handleExportCsv = async () => {
    const { exportToCsv } = await import('../services/ExportService')
    exportToCsv(data, columns, filename)
  }

  const handleExportExcel = async () => {
    const { exportToExcel } = await import('../services/ExportService')
    exportToExcel(data, columns, filename)
  }

  const handleExportPdf = async () => {
    const { exportToPdf } = await import('../services/ExportService')
    exportToPdf(data, columns, filename, title)
  }

  const handlePrint = async () => {
    const { printReport } = await import('../services/ExportService')
    printReport(data, columns, title ?? filename)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="ghost" size="sm" onClick={handleExportCsv} title={t('export.csv')}>
        <FileText className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline ms-1">{t('export.csv')}</span>
      </Button>
      <Button variant="ghost" size="sm" onClick={handleExportExcel} title={t('export.excel')}>
        <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline ms-1">{t('export.excel')}</span>
      </Button>
      <Button variant="ghost" size="sm" onClick={handleExportPdf} title={t('export.pdf')}>
        <Download className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline ms-1">{t('export.pdf')}</span>
      </Button>
      <Button variant="ghost" size="sm" onClick={handlePrint} title={t('export.print')}>
        <Printer className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline ms-1">{t('export.print')}</span>
      </Button>
      {onSave && (
        <Button variant="ghost" size="sm" onClick={onSave} title={t('export.save')}>
          <Save className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline ms-1">{t('export.save')}</span>
        </Button>
      )}
    </div>
  )
}

export default ReportExportBar
