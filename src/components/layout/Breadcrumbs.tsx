import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/cn'

export interface BreadcrumbItem {
  label: ReactNode
  to?: string
  icon?: ReactNode
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const { t } = useTranslation('ui')

  if (items.length === 0) return null

  return (
    <nav aria-label={t('breadcrumb')} className={cn('flex items-center', className)}>
      <ol className="flex items-center gap-1.5 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          const content = item.icon ? (
            <span className="inline-flex items-center gap-1.5">
              {item.icon}
              {item.label}
            </span>
          ) : (
            item.label
          )

          return (
            <li key={index} className="flex items-center gap-1.5">
              {index > 0 && (
                <span aria-hidden="true" className="text-content-subtle">
                  /
                </span>
              )}
              {isLast ? (
                <span aria-current="page" className="font-medium text-content">
                  {content}
                </span>
              ) : (
                <a
                  href={item.to}
                  className="text-content-muted transition-colors hover:text-content"
                >
                  {content}
                </a>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumbs
