import { memo } from 'react'
import type { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'
import type { Align } from '@/types/common'

export interface TableProps extends Omit<TableHTMLAttributes<HTMLTableElement>, 'className'> {
  /** Reduces vertical cell padding for dense enterprise data. */
  dense?: boolean
  /** Stripe odd rows. */
  striped?: boolean
  className?: string
}

export interface TableHeadProps extends Omit<HTMLAttributes<HTMLTableSectionElement>, 'className'> {
  className?: string
}

export interface TableBodyProps extends Omit<HTMLAttributes<HTMLTableSectionElement>, 'className'> {
  className?: string
}

export interface TableFootProps extends Omit<HTMLAttributes<HTMLTableSectionElement>, 'className'> {
  className?: string
}

export interface TableRowProps extends Omit<HTMLAttributes<HTMLTableRowElement>, 'className'> {
  selected?: boolean
  className?: string
}

export interface TableHeadCellProps extends Omit<
  ThHTMLAttributes<HTMLTableCellElement>,
  'className' | 'align'
> {
  align?: Align
  className?: string
}

export interface TableCellProps extends Omit<
  TdHTMLAttributes<HTMLTableCellElement>,
  'className' | 'align'
> {
  align?: Align
  className?: string
}

export interface TableCaptionProps extends Omit<
  HTMLAttributes<HTMLTableCaptionElement>,
  'className'
> {
  className?: string
}

const alignClasses: Record<Align, string> = {
  start: 'text-start',
  center: 'text-center',
  end: 'text-end',
}

export function Table({ dense = false, striped = false, className, ...rest }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={cn(
          'w-full caption-bottom border-collapse text-sm',
          dense && '[&_td]:py-1.5 [&_th]:py-2',
          striped && '[&_tbody_tr:nth-child(even)]:bg-surface-sunken/40',
          className,
        )}
        {...rest}
      />
    </div>
  )
}

export function TableHead({ className, ...rest }: TableHeadProps) {
  return <thead className={cn('border-b border-border', className)} {...rest} />
}

export function TableBody({ className, ...rest }: TableBodyProps) {
  return <tbody className={cn(className)} {...rest} />
}

export function TableFoot({ className, ...rest }: TableFootProps) {
  return <tfoot className={cn('border-t border-border bg-surface-sunken', className)} {...rest} />
}

export const TableRow = memo(function TableRow({ selected = false, className, ...rest }: TableRowProps) {
  return (
    <tr
      className={cn(
        'border-b border-border transition-colors duration-100',
        'hover:bg-surface-sunken/60',
        selected && 'bg-primary-subtle',
        className,
      )}
      {...rest}
    />
  )
})

export const TableHeadCell = memo(function TableHeadCell({ align = 'start', className, ...rest }: TableHeadCellProps) {
  return (
    <th
      scope="col"
      className={cn(
        'whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-content-muted',
        alignClasses[align],
        className,
      )}
      {...rest}
    />
  )
})

export const TableCell = memo(function TableCell({ align = 'start', className, ...rest }: TableCellProps) {
  return (
    <td
      className={cn('px-4 py-2.5 align-middle text-content', alignClasses[align], className)}
      {...rest}
    />
  )
})

export function TableCaption({ className, ...rest }: TableCaptionProps) {
  return (
    <caption className={cn('mt-3 text-start text-xs text-content-subtle', className)} {...rest} />
  )
}

export default Table
