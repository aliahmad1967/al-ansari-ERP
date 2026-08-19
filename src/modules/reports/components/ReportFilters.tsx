import { useTranslation } from 'react-i18next'
import { Filter, RotateCcw } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import type { ReportParameter, ReportFilterOption } from '../types/report.types'

interface ReportFiltersProps {
  parameters: ReportParameter[]
  values: Record<string, string | number | boolean>
  onChange: (key: string, value: string | number | boolean) => void
  onReset: () => void
}

export function ReportFilters({ parameters, values, onChange, onReset }: ReportFiltersProps) {
  const { t } = useTranslation('reports')

  if (parameters.length === 0) return null

  return (
    <div className="rounded-lg border border-border bg-surface-raised p-4">
      <div className="mb-3 flex items-center gap-2">
        <Filter className="h-4 w-4 text-content-subtle" aria-hidden="true" />
        <h3 className="text-sm font-medium text-content">{t('filters.title')}</h3>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {parameters.map((param) => (
          <FilterField
            key={param.key}
            parameter={param}
            value={values[param.key]}
            onChange={(val) => onChange(param.key, val)}
          />
        ))}
      </div>
      <div className="mt-3 flex justify-end">
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="ms-1">{t('filters.reset')}</span>
        </Button>
      </div>
    </div>
  )
}

function FilterField({
  parameter,
  value,
  onChange,
}: {
  parameter: ReportParameter
  value: string | number | boolean | undefined
  onChange: (value: string | number | boolean) => void
}) {
  const { t } = useTranslation('reports')

  switch (parameter.type) {
    case 'text':
      return (
        <div>
          <label className="mb-1 block text-xs font-medium text-content-muted">
            {t(parameter.labelKey)}
          </label>
          <Input
            type="text"
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
            placeholder={parameter.placeholder ? t(parameter.placeholder) : undefined}
          />
        </div>
      )

    case 'select':
    case 'multiSelect':
      return (
        <div>
          <label className="mb-1 block text-xs font-medium text-content-muted">
            {t(parameter.labelKey)}
          </label>
          <Select
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">{t('filters.all')}</option>
            {(parameter.options ?? []).map((opt: ReportFilterOption) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </div>
      )

    case 'date':
      return (
        <div>
          <label className="mb-1 block text-xs font-medium text-content-muted">
            {t(parameter.labelKey)}
          </label>
          <Input
            type="date"
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      )

    case 'dateRange':
      return (
        <div>
          <label className="mb-1 block text-xs font-medium text-content-muted">
            {t(parameter.labelKey)}
          </label>
          <div className="flex gap-2">
            <Input
              type="date"
              value={String(value ?? '').split(',')[0] ?? ''}
              onChange={(e) => {
                const end = String(value ?? '').split(',')[1] ?? ''
                onChange(`${e.target.value},${end}`)
              }}
            />
            <Input
              type="date"
              value={String(value ?? '').split(',')[1] ?? ''}
              onChange={(e) => {
                const start = String(value ?? '').split(',')[0] ?? ''
                onChange(`${start},${e.target.value}`)
              }}
            />
          </div>
        </div>
      )

    case 'number':
      return (
        <div>
          <label className="mb-1 block text-xs font-medium text-content-muted">
            {t(parameter.labelKey)}
          </label>
          <Input
            type="number"
            value={String(value ?? '')}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        </div>
      )

    default:
      return null
  }
}

export default ReportFilters
