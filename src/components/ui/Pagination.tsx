import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/cn'
import { clamp } from '@/lib/utils'

export interface PaginationProps {
  page: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  /** When provided, shows the "items per page" selector. */
  pageSizeOptions?: number[]
  onPageSizeChange?: (pageSize: number) => void
  className?: string
}

type PageItem = number | 'ellipsis-start' | 'ellipsis-end'

function getPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const items: PageItem[] = []
  items.push(1)

  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  if (start > 2) items.push('ellipsis-start')
  for (let page = start; page <= end; page += 1) {
    items.push(page)
  }
  if (end < totalPages - 1) items.push('ellipsis-end')

  items.push(totalPages)
  return items
}

export const Pagination = memo(function Pagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  pageSizeOptions,
  onPageSizeChange,
  className,
}: PaginationProps) {
  const { t } = useTranslation('ui')

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = clamp(page, 1, totalPages)
  const rangeStart = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1
  const rangeEnd = Math.min(totalItems, safePage * pageSize)
  const pageItems = useMemo(() => getPageItems(safePage, totalPages), [safePage, totalPages])

  const goToPage = (next: number): void => {
    onPageChange(clamp(next, 1, totalPages))
  }

  const navButtonClasses =
    'inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-raised text-content-muted transition-colors hover:bg-surface-sunken hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/40 disabled:pointer-events-none disabled:opacity-50'

  return (
    <div
      className={cn('flex flex-wrap items-center justify-between gap-3', className)}
      aria-label={t('pagination.label')}
    >
      <div className="flex items-center gap-3">
        <p className="text-sm text-content-muted">
          {t('pagination.resultRange', { start: rangeStart, end: rangeEnd, total: totalItems })}
        </p>

        {onPageSizeChange && pageSizeOptions && (
          <div className="flex items-center gap-2">
            <label htmlFor="page-size" className="text-sm text-content-muted">
              {t('pagination.itemsPerPage')}
            </label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-8 rounded-md border border-border-input bg-surface-raised px-2 text-sm text-content focus:outline-none focus:ring-2 focus:ring-focus-ring/30"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <nav className="flex items-center gap-1" aria-label={t('pagination.label')}>
        <button
          type="button"
          onClick={() => goToPage(safePage - 1)}
          disabled={safePage <= 1}
          className={navButtonClasses}
          aria-label={t('pagination.previous')}
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
        </button>

        {pageItems.map((item, index) => {
          if (item === 'ellipsis-start' || item === 'ellipsis-end') {
            return (
              <span
                key={`${item}-${index}`}
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center text-sm text-content-subtle"
              >
                …
              </span>
            )
          }

          return (
            <button
              key={item}
              type="button"
              onClick={() => goToPage(item)}
              aria-current={item === safePage ? 'page' : undefined}
              aria-label={t('pagination.goToPage', { page: item })}
              className={cn(
                'inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/40',
                item === safePage
                  ? 'bg-primary text-primary-content'
                  : 'text-content-muted hover:bg-surface-sunken hover:text-content',
              )}
            >
              {item}
            </button>
          )
        })}

        <button
          type="button"
          onClick={() => goToPage(safePage + 1)}
          disabled={safePage >= totalPages}
          className={navButtonClasses}
          aria-label={t('pagination.next')}
        >
          <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
        </button>
      </nav>
    </div>
  )
})

export default Pagination
