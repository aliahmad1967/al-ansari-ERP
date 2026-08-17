import { useSyncExternalStore, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  type LucideIcon,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/cn'
import { useLanguage } from '@/hooks/useLanguage'
import { getAppUiState, subscribeAppUi, toggleSidebarCollapsed } from '@/stores/app.store'

export interface SidebarItem {
  id: string
  label: ReactNode
  icon?: ReactNode
  to?: string
  badge?: ReactNode
  active?: boolean
  disabled?: boolean
  onClick?: () => void
}

export interface SidebarSection {
  id: string
  label?: ReactNode
  items: SidebarItem[]
}

export interface SidebarProps {
  /** Brand block rendered at the top of the sidebar. */
  brand?: ReactNode
  sections: SidebarSection[]
  footer?: ReactNode
  /** Called after an item is activated (used to close the mobile drawer). */
  onNavigate?: () => void
  /** Controls whether labels are hidden (collapsed state). */
  collapsed?: boolean
  className?: string
}

/**
 * Navigation sidebar. Pure content component — the app shell decides whether to
 * render it as a fixed desktop rail or inside a mobile drawer.
 */
export function Sidebar({
  brand,
  sections,
  footer,
  onNavigate,
  collapsed = false,
  className,
}: SidebarProps) {
  const { t } = useTranslation('common')

  const isCollapsed = collapsed

  return (
    <aside
      className={cn('flex h-full flex-col border-e border-border bg-surface-raised', className)}
      aria-label={t('navigation.sidebarLabel')}
    >
      {brand && (
        <div className="flex h-[var(--topbar-height)] shrink-0 items-center px-4">{brand}</div>
      )}

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {sections.map((section) => (
          <div key={section.id} className="mb-4 last:mb-0">
            {section.label && !isCollapsed && (
              <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wide text-content-subtle">
                {section.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarItemLink
                  key={item.id}
                  item={item}
                  collapsed={isCollapsed}
                  onNavigate={onNavigate}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {footer && <div className="shrink-0 border-t border-border p-2">{footer}</div>}
    </aside>
  )
}

interface SidebarItemLinkProps {
  item: SidebarItem
  collapsed: boolean
  onNavigate?: () => void
}

function SidebarItemLink({ item, collapsed, onNavigate }: SidebarItemLinkProps) {
  const { label, icon, to, badge, disabled, onClick } = item

  const content = (
    <>
      {icon && <span className="shrink-0 text-current">{icon}</span>}
      {!collapsed && <span className="min-w-0 flex-1 truncate text-start">{label}</span>}
      {!collapsed && badge}
    </>
  )

  const baseClasses =
    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150'
  const hoverClasses = 'hover:bg-surface-sunken hover:text-content'

  if (disabled) {
    return (
      <li>
        <span
          aria-disabled="true"
          title={collapsed ? String(label) : undefined}
          className={cn(
            baseClasses,
            'cursor-not-allowed text-content-subtle opacity-60',
            collapsed && 'justify-center px-0',
          )}
        >
          {content}
        </span>
      </li>
    )
  }

  const clickHandler = (): void => {
    onClick?.()
    onNavigate?.()
  }

  if (to) {
    return (
      <li>
        <NavLink
          to={to}
          onClick={clickHandler}
          title={collapsed ? String(label) : undefined}
          className={({ isActive }) =>
            cn(
              baseClasses,
              hoverClasses,
              (isActive || item.active) && 'bg-primary-subtle text-primary hover:bg-primary-subtle',
              !(isActive || item.active) && 'text-content-muted',
              collapsed && 'justify-center px-0',
            )
          }
        >
          {content}
        </NavLink>
      </li>
    )
  }

  return (
    <li>
      <button
        type="button"
        onClick={clickHandler}
        title={collapsed ? String(label) : undefined}
        className={cn(
          baseClasses,
          hoverClasses,
          'text-content-muted',
          item.active && 'bg-primary-subtle text-primary hover:bg-primary-subtle',
          collapsed && 'justify-center px-0',
        )}
      >
        {content}
      </button>
    </li>
  )
}

/** Desktop collapse toggle button, rendered by the app shell. */
export function SidebarCollapseToggle({ label }: { label: string }) {
  const { sidebarCollapsed } = useSyncExternalStore(subscribeAppUi, getAppUiState)
  const { isRTL } = useLanguage()

  const Icon: LucideIcon = isRTL
    ? sidebarCollapsed
      ? PanelRightOpen
      : PanelRightClose
    : sidebarCollapsed
      ? PanelLeftOpen
      : PanelLeftClose

  return (
    <button
      type="button"
      onClick={toggleSidebarCollapsed}
      aria-label={label}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-content-subtle transition-colors hover:bg-surface-sunken hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/40"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  )
}

export default Sidebar
