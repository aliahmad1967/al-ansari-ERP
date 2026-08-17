import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/cn'

export interface MobileNavigationItem {
  id: string
  label: ReactNode
  to: string
  icon?: ReactNode
  active?: boolean
}

export interface MobileNavigationProps {
  items: MobileNavigationItem[]
  className?: string
}

/**
 * Bottom tab bar shown below the desktop breakpoint. Keep to 5 items for a
 * comfortable density.
 */
export function MobileNavigation({ items, className }: MobileNavigationProps) {
  const { t } = useTranslation('common')

  return (
    <nav
      aria-label={t('navigation.mobileNav')}
      className={cn(
        'fixed inset-x-0 bottom-0 z-sticky grid border-t border-border bg-surface-raised lg:hidden',
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${Math.max(items.length, 1)}, minmax(0, 1fr))` }}
    >
      {items.map((item) => (
        <NavLink
          key={item.id}
          to={item.to}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium transition-colors',
              isActive || item.active ? 'text-primary' : 'text-content-subtle hover:text-content',
            )
          }
        >
          {item.icon}
          <span className="max-w-full truncate">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default MobileNavigation
