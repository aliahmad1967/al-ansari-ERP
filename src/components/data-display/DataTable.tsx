import { memo, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowDown, ArrowUp, ChevronsUpDown, Inbox } from 'lucide-react'

import Checkbox from '@/components/ui/Checkbox'
import EmptyState from '@/components/ui/EmptyState'
import Skeleton from '@/components/ui/Skeleton'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from '@/components/ui/Table'
import { cn } from '@/lib/cn'
import type { Align, SortDirection } from '@/types/common'

export interface DataTableColumn<T> {
  key: string
  header: ReactNode
  /** Custom cell renderer; defaults to `row[key]`. */
  render?: (row: T) => ReactNode
  /** Value used for sorting; falls back to `render`/`row[key]`. */
  sortValue?: (row: T) => string | number
  sortable?: boolean
  align?: Align
  width?: string
}

export interface DataTableSorting {
  key: string
  direction: SortDirection
}

export interface DataTableProps<T> {
  columns: Array<DataTableColumn<T>>
  data: T[]
  rowKey: (row: T) => string
  loading?: boolean
  /** Controlled sorting. When omitted and columns are sortable, sorting is internal. */
  sorting?: DataTableSorting | null
  onSortingChange?: (sorting: DataTableSorting | null) => void
  selectable?: boolean
  selectedKeys?: string[]
  onSelectionChange?: (keys: string[]) => void
  onRowClick?: (row: T) => void
  empty?: ReactNode
  /** Optional element rendered below the table (e.g. Pagination). */
  footer?: ReactNode
  dense?: boolean
  striped?: boolean
  loadingRows?: number
  caption?: ReactNode
  className?: string
}

function defaultCellValue<T>(row: T, key: string): ReactNode {
  const value = (row as Record<string, unknown>)[key]
  return typeof value === 'object' && value !== null ? null : (value as ReactNode)
}

function DataTableInner<T>({
  columns,
  data,
  rowKey,
  loading = false,
  sorting,
  onSortingChange,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  onRowClick,
  empty,
  footer,
  dense = false,
  striped = false,
  loadingRows = 8,
  caption,
  className,
}: DataTableProps<T>) {
  const { t, i18n } = useTranslation('ui')
  const [internalSorting, setInternalSorting] = useState<DataTableSorting | null>(null)

  const activeSorting = sorting !== undefined ? sorting : internalSorting
  const updateSorting = (next: DataTableSorting | null): void => {
    if (onSortingChange) {
      onSortingChange(next)
    } else {
      setInternalSorting(next)
    }
  }

  const sortableColumns = useMemo(() => columns.filter((column) => column.sortable), [columns])

  const sortedData = useMemo(() => {
    if (!activeSorting) return data
    const column = sortableColumns.find((item) => item.key === activeSorting.key)
    if (!column) return data

    const directionMultiplier = activeSorting.direction === 'asc' ? 1 : -1

    return [...data].sort((a, b) => {
      const valueA = column.sortValue?.(a) ?? defaultCellValue(a, column.key)
      const valueB = column.sortValue?.(b) ?? defaultCellValue(b, column.key)

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return (valueA - valueB) * directionMultiplier
      }
      return (
        String(valueA ?? '').localeCompare(
          String(valueB ?? ''),
          i18n.resolvedLanguage ?? undefined,
          {
            numeric: true,
          },
        ) * directionMultiplier
      )
    })
  }, [data, activeSorting, sortableColumns, i18n.resolvedLanguage])

  const handleSortToggle = (column: DataTableColumn<T>): void => {
    if (!column.sortable) return

    if (!activeSorting || activeSorting.key !== column.key) {
      updateSorting({ key: column.key, direction: 'asc' })
      return
    }
    if (activeSorting.direction === 'asc') {
      updateSorting({ key: column.key, direction: 'desc' })
      return
    }
    updateSorting(null)
  }

  const selectedSet = useMemo(() => new Set(selectedKeys), [selectedKeys])
  const allKeys = useMemo(() => data.map((row) => rowKey(row)), [data, rowKey])
  const allSelected = allKeys.length > 0 && allKeys.every((key) => selectedSet.has(key))
  const someSelected = !allSelected && allKeys.some((key) => selectedSet.has(key))

  const toggleAll = (): void => {
    const next = allSelected
      ? selectedKeys.filter((key) => !allKeys.includes(key))
      : [...new Set([...selectedKeys, ...allKeys])]
    onSelectionChange?.(next)
  }

  const toggleRow = (key: string): void => {
    const next = selectedSet.has(key)
      ? selectedKeys.filter((item) => item !== key)
      : [...selectedKeys, key]
    onSelectionChange?.(next)
  }

  const getCellAlign = (column: DataTableColumn<T>): Align => column.align ?? 'start'

  return (
    <div className={cn('w-full', className)}>
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table dense={dense} striped={striped}>
          {caption && <TableCaption>{caption}</TableCaption>}

          <TableHead>
            <TableRow className="hover:bg-transparent">
              {selectable && (
                <TableHeadCell align="start" className="w-10">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={toggleAll}
                    aria-label={t('table.selectAll')}
                    disabled={loading || allKeys.length === 0}
                  />
                </TableHeadCell>
              )}

              {columns.map((column) => {
                const isActive = activeSorting?.key === column.key
                const ariaSort = isActive
                  ? activeSorting?.direction === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : column.sortable
                    ? 'none'
                    : undefined

                return (
                  <TableHeadCell
                    key={column.key}
                    align={getCellAlign(column)}
                    style={column.width ? { width: column.width } : undefined}
                    aria-sort={ariaSort}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSortToggle(column)}
                        className={cn(
                          'inline-flex items-center gap-1.5 uppercase tracking-wide transition-colors',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/40',
                          isActive ? 'text-content' : 'hover:text-content',
                        )}
                      >
                        {column.header}
                        {isActive ? (
                          activeSorting?.direction === 'asc' ? (
                            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                          )
                        ) : (
                          <ChevronsUpDown
                            className="h-3.5 w-3.5 text-content-subtle"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </TableHeadCell>
                )
              })}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              Array.from({ length: loadingRows }, (_, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-transparent">
                  {selectable && (
                    <TableCell>
                      <Skeleton className="h-4 w-4 rounded" />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={column.key} align={getCellAlign(column)}>
                      <Skeleton className="h-3.5 w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : sortedData.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  align="center"
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-4"
                >
                  {empty ?? (
                    <EmptyState
                      icon={<Inbox className="h-6 w-6" aria-hidden="true" />}
                      title={t('table.noData')}
                      description={t('table.noDataHint')}
                    />
                  )}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row) => {
                const key = rowKey(row)
                const isSelected = selectedSet.has(key)

                return (
                  <TableRow
                    key={key}
                    selected={isSelected}
                    onClick={() => onRowClick?.(row)}
                    className={cn(onRowClick && 'cursor-pointer')}
                  >
                    {selectable && (
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleRow(key)}
                          aria-label={t('table.selectRow')}
                        />
                      </TableCell>
                    )}

                    {columns.map((column) => (
                      <TableCell key={column.key} align={getCellAlign(column)}>
                        {column.render?.(row) ?? defaultCellValue(row, column.key)}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {footer && <div className="mt-4">{footer}</div>}
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DataTable: <T>(props: DataTableProps<T>) => React.JSX.Element = memo(DataTableInner) as any

export default DataTable
