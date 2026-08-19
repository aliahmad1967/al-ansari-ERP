import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { ReportDataPoint } from '../types/report.types'

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-CA')
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50)
}

export function exportToCsv<T extends ReportDataPoint>(
  data: T[],
  columns: Array<{ key: string; header: string }>,
  filename: string,
): void {
  const headers = columns.map((c) => c.header)
  const rows = data.map((row) =>
    columns.map((col) => {
      const val = row[col.key]
      if (val === null || val === undefined) return ''
      if (val instanceof Date) return formatDate(val)
      return String(val)
    }),
  )

  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => {
          if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
            return `"${cell.replace(/"/g, '""')}"`
          }
          return cell
        })
        .join(','),
    )
    .join('\n')

  const bom = '\uFEFF'
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, `${sanitizeFilename(filename)}_${formatDate(new Date())}.csv`)
}

export function exportToExcel<T extends ReportDataPoint>(
  data: T[],
  columns: Array<{ key: string; header: string }>,
  filename: string,
  sheetName?: string,
): void {
  const headers = columns.map((c) => c.header)
  const rows = data.map((row) =>
    columns.map((col) => {
      const val = row[col.key]
      if (val === null || val === undefined) return ''
      if (val instanceof Date) return formatDate(val)
      return val
    }),
  )

  const wsData = [headers, ...rows]
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  ws['!cols'] = columns.map(() => ({ wch: 18 }))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName ?? 'Report')

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
  saveAs(blob, `${sanitizeFilename(filename)}_${formatDate(new Date())}.xlsx`)
}

export function exportToPdf<T extends ReportDataPoint>(
  data: T[],
  columns: Array<{ key: string; header: string }>,
  filename: string,
  title?: string,
): void {
  const doc = new jsPDF({ orientation: columns.length > 6 ? 'landscape' : 'portrait' })

  if (title) {
    doc.setFontSize(16)
    doc.text(title, 14, 20)
    doc.setFontSize(10)
    doc.text(`Generated: ${formatDate(new Date())}`, 14, 28)
  }

  const headers = columns.map((c) => c.header)
  const rows = data.map((row) =>
    columns.map((col) => {
      const val = row[col.key]
      if (val === null || val === undefined) return ''
      if (val instanceof Date) return formatDate(val)
      return String(val)
    }),
  )

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: title ? 34 : 14,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  })

  doc.save(`${sanitizeFilename(filename)}_${formatDate(new Date())}.pdf`)
}

export function printReport(
  data: ReportDataPoint[],
  columns: Array<{ key: string; header: string }>,
  title: string,
): void {
  const headers = columns.map((c) => c.header)
  const rows = data.map((row) =>
    columns.map((col) => {
      const val = row[col.key]
      if (val === null || val === undefined) return ''
      if (val instanceof Date) return formatDate(val)
      return String(val)
    }),
  )

  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const dir = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'

  const tableRows = rows
    .map(
      (row) => `<tr>${row.map((cell) => `<td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-size:13px">${cell}</td>`).join('')}</tr>`,
    )
    .join('')

  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="${dir}">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body { font-family: ${dir === 'rtl' ? "'Noto Sans Arabic', 'Segoe UI'" : "'Segoe UI', Arial"}, sans-serif; margin: 20px; color: #1a1a1a; direction: ${dir}; }
        h1 { font-size: 20px; margin-bottom: 4px; }
        .meta { font-size: 12px; color: #666; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #3b82f6; color: white; padding: 8px 10px; text-align: ${dir === 'rtl' ? 'right' : 'left'}; font-size: 13px; font-weight: 600; }
        td { text-align: ${dir === 'rtl' ? 'right' : 'left'}; }
        tr:nth-child(even) { background: #f9fafb; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="meta">${new Date().toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US')}</div>
      <table>
        <thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => { printWindow.print() }, 300)
}
