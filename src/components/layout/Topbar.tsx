import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Menu } from 'lucide-react'

import { cn } from '@/lib/cn'

export interface TopbarProps {
  /** Slot on the inline-start side (after the optional menu button). */
  leading?: ReactNode
  /** Centered / flexible slot (e.g. breadcrumbs or search). */
  center?: ReactNode
  /** Action slot on the inline-end side. */
  actions?: ReactNode
  /** Renders a hamburger button visible below the desktop breakpoint. */
  onMenuClick?: () => void
  menuButtonLabel?: string
  className?: string
}

export function Topbar({
  leading,
  center,
  actions,
  onMenuClick,
  menuButtonLabel,
  className,
}: TopbarProps) {
  const { t } = useTranslation('ui')
  const resolvedMenuButtonLabel = menuButtonLabel ?? t('menu')
  return (
    <header
      className={cn(
        'flex h-[var(--topbar-height)] shrink-0 items-center gap-3 border-b border-border bg-surface-raised px-4 sm:px-6',
        className,
      )}
    >
      {onMenuClick && (
        <button
          type="button"
          onClick={onMenuClick}
          aria-label={resolvedMenuButtonLabel}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-content-muted transition-colors hover:bg-surface-sunken hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/40 lg:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      )}

      {leading && <div className="shrink-0">{leading}</div>}

      {center && <div className="min-w-0 flex-1">{center}</div>}

      {actions && <div className="ms-auto flex shrink-0 items-center gap-1.5">{actions}</div>}
    </header>
  )
}

export default Topbar
