import type { LucideIcon } from 'lucide-react'
import type { DataTableColumn } from '@/components/data-display/DataTable'
import type { Tone } from '@/types/common'

export type ReportModule = 'hr' | 'finance' | 'inventory' | 'procurement' | 'sales' | 'assets' | 'projects' | 'accounting'

export type FilterType = 'text' | 'select' | 'date' | 'dateRange' | 'number' | 'multiSelect'

export interface ReportFilterOption {
  label: string
  value: string
}

export interface ReportParameter {
  key: string
  labelKey: string
  type: FilterType
  defaultValue?: string | number | boolean
  options?: ReportFilterOption[]
  placeholder?: string
  required?: boolean
  min?: number
  max?: number
}

export interface ReportFilter {
  parameters: ReportParameter[]
}

export type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'donut'

export interface ReportChartConfig {
  type: ChartType
  dataKey: string
  nameKey: string
  color?: string
  labelKey: string
}

export interface ReportDefinition {
  id: string
  module: ReportModule
  nameKey: string
  descriptionKey: string
  icon: LucideIcon
  permission: string
  filters: ReportFilter
  columns: DataTableColumn<Record<string, unknown>>[]
  charts?: ReportChartConfig[]
}

export interface ReportDataPoint {
  [key: string]: string | number | boolean | Date | null
}

export interface ReportResult<T extends ReportDataPoint = ReportDataPoint> {
  data: T[]
  columns: DataTableColumn<T>[]
  charts?: ReportChartConfig[]
  totalCount: number
  generatedAt: Date
}

export interface SavedReport {
  _id: string
  name: string
  reportId: string
  module: ReportModule
  filters: Record<string, string | number | boolean>
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
  deletedAt: Date | null
}

export interface SavedReportInput {
  name: string
  reportId: string
  module: ReportModule
  filters: Record<string, string | number | boolean>
}

export interface ReportSummaryCard {
  id: string
  labelKey: string
  value: string | number
  tone: Tone
  icon: LucideIcon
}

export interface ReportPageConfig {
  module: ReportModule
  titleKey: string
  descriptionKey: string
  reports: ReportDefinition[]
}
