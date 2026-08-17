import type { ReactNode } from 'react'

import PageHeader, { type PageHeaderProps } from '@/components/layout/PageHeader'
import { cn } from '@/lib/cn'

export interface PageLayoutProps extends PageHeaderProps {
  children: ReactNode
  /** Overrides the default max-width content container. */
  fullWidth?: boolean
  className?: string
  contentClassName?: string
}

/**
 * Reusable page scaffold: responsive gutters, optional header and a
 * max-width content container. Compose pages as <PageLayout> + content.
 */
export function PageLayout({
  title,
  description,
  breadcrumbs,
  actions,
  icon,
  children,
  fullWidth = false,
  className,
  contentClassName,
}: PageLayoutProps) {
  return (
    <div className={cn('mx-auto w-full px-4 pb-10 sm:px-6 lg:px-8', className)}>
      {(title || breadcrumbs || actions) && (
        <PageHeader
          title={title}
          description={description}
          breadcrumbs={breadcrumbs}
          actions={actions}
          icon={icon}
        />
      )}

      <div
        className={cn(!fullWidth && 'mx-auto w-full max-w-[var(--content-max)]', contentClassName)}
      >
        {children}
      </div>
    </div>
  )
}

export default PageLayout
