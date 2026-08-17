import type { ReactNode } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/cn'
import { Inbox } from 'lucide-react'

export interface ChartCardProps {
  title: string
  description?: string
  loading?: boolean
  empty?: boolean
  emptyTitle?: string
  emptyDescription?: string
  className?: string
  children: ReactNode
  actions?: ReactNode
}

export function ChartCard({
  title,
  description,
  loading = false,
  empty = false,
  emptyTitle,
  emptyDescription,
  className,
  children,
  actions,
}: ChartCardProps) {
  return (
    <Card className={cn('h-full', className)}>
      <CardHeader>
        <div className="min-w-0 flex-1">
          <CardTitle>{title}</CardTitle>
          {description && (
            <p className="mt-0.5 text-sm text-content-muted">{description}</p>
          )}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : empty ? (
          <EmptyState
            icon={<Inbox className="h-6 w-6" />}
            title={emptyTitle ?? title}
            description={emptyDescription}
            className="py-8"
          />
        ) : (
          <div className="h-64">{children}</div>
        )}
      </CardContent>
    </Card>
  )
}

export default ChartCard
