import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

export interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  breadcrumbs?: ReactNode
  /** Action buttons rendered on the inline-end side. */
  actions?: ReactNode
  icon?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  icon,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn('py-5 sm:py-6', className)}>
      {breadcrumbs && <div className="mb-3">{breadcrumbs}</div>}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          {icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight text-content sm:text-2xl">
              {title}
            </h1>
            {description && <p className="mt-1 text-sm text-content-muted">{description}</p>}
          </div>
        </div>

        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}

export default PageHeader
