import { Suspense, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useSyncExternalStore } from 'react'
import { Outlet } from 'react-router-dom'
import {
  Boxes,
  Languages,
  LayoutDashboard,
  LogOut,
  Moon,
  Package,
  Palette,
  ShoppingCart,
  Sun,
  User,
  Wallet,
} from 'lucide-react'

import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import MobileNavigation from '@/components/layout/MobileNavigation'
import Sidebar, { SidebarCollapseToggle, type SidebarSection } from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { cn } from '@/lib/cn'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { useTheme } from '@/hooks/useTheme'
import { closeMobileNav, getAppUiState, openMobileNav, subscribeAppUi } from '@/stores/app.store'

export default function AppLayout() {
  const { t } = useTranslation('common')
  const { t: tShowcase } = useTranslation('showcase')
  const { t: tAuth } = useTranslation('auth')
  const { theme, toggleTheme } = useTheme()
  const { toggleLanguage } = useLanguage()
  const { sidebarCollapsed, mobileNavOpen } = useSyncExternalStore(subscribeAppUi, getAppUiState)
  const { session, logout } = useAuth()

  const sections: SidebarSection[] = [
    {
      id: 'overview',
      label: tShowcase('layout.sidebarSection'),
      items: [
        {
          id: 'dashboard',
          label: tShowcase('layout.sidebarDashboard'),
          icon: <LayoutDashboard className="h-4 w-4" aria-hidden="true" />,
          to: '/',
        },
        {
          id: 'showcase',
          label: tShowcase('layout.sidebarShowcase'),
          icon: <Palette className="h-4 w-4" aria-hidden="true" />,
          to: '/components',
        },
      ],
    },
    {
      id: 'modules',
      label: tShowcase('layout.sidebarModules'),
      items: [
        {
          id: 'finance',
          label: tShowcase('layout.sidebarFinance'),
          icon: <Wallet className="h-4 w-4" aria-hidden="true" />,
          disabled: true,
        },
        {
          id: 'inventory',
          label: tShowcase('layout.sidebarInventory'),
          icon: <Package className="h-4 w-4" aria-hidden="true" />,
          disabled: true,
        },
        {
          id: 'sales',
          label: tShowcase('layout.sidebarSales'),
          icon: <ShoppingCart className="h-4 w-4" aria-hidden="true" />,
          disabled: true,
        },
      ],
    },
  ]

  const brand = (collapsed: boolean): ReactNode => (
    <span className={cn('flex min-w-0 items-center gap-2.5', collapsed && 'justify-center')}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-content">
        <Boxes className="h-4 w-4" aria-hidden="true" />
      </span>
      {!collapsed && (
        <span className="truncate text-base font-semibold tracking-tight text-content">
          {t('appName')}
        </span>
      )}
    </span>
  )

  const userDisplayName =
    session?.user.fullNameAr && session.user.fullNameAr.trim()
      ? session.user.fullNameAr
      : session?.user.fullName ?? ''

  return (
    <div
      className={cn(
        'flex min-h-screen flex-col bg-surface text-content',
        sidebarCollapsed && 'sidebar-collapsed',
      )}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:start-2 focus:top-2 focus:z-skip focus:rounded-md focus:bg-surface-raised focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-content focus:shadow-md"
      >
        {t('navigation.skipToContent')}
      </a>

      <div className="hidden lg:block">
        <div className="fixed inset-y-0 start-0 z-sticky w-[var(--sidebar-current)] transition-[width] duration-200">
          <Sidebar
            collapsed={sidebarCollapsed}
            brand={brand(sidebarCollapsed)}
            sections={sections}
            footer={
              <div className="flex flex-col items-center gap-2">
                <SidebarCollapseToggle label={t('navigation.sidebarToggle')} />
              </div>
            }
          />
        </div>
      </div>

      <Drawer
        open={mobileNavOpen}
        onOpenChange={(open) => (open ? openMobileNav() : closeMobileNav())}
        side="start"
        width="min(20rem, 85vw)"
        className="lg:hidden"
      >
        <Sidebar
          collapsed={false}
          brand={brand(false)}
          sections={sections}
          onNavigate={closeMobileNav}
        />
      </Drawer>

      <div className="flex min-h-screen flex-col pb-[var(--mobile-nav-height)] transition-[padding-inline-start] duration-200 lg:pb-0 lg:ps-[var(--sidebar-current)]">
        <Topbar
          onMenuClick={openMobileNav}
          menuButtonLabel={t('navigation.sidebarToggle')}
          leading={
            <span className="hidden items-center text-base font-semibold tracking-tight text-content sm:inline-flex">
              {t('appName')}
            </span>
          }
          actions={
            <>
              {/* User info */}
              {userDisplayName && (
                <span className="hidden items-center gap-2 text-sm text-content-subtle md:flex">
                  <User className="h-4 w-4" aria-hidden="true" />
                  <span className="max-w-[120px] truncate">{userDisplayName}</span>
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                aria-label={t('navigation.themeToggle')}
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Moon className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLanguage}
                aria-label={t('navigation.languageToggle')}
              >
                <Languages className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                aria-label={tAuth('logout.button')}
                title={tAuth('logout.button')}
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </Button>
            </>
          }
        />

        <main id="main-content" className="mx-auto w-full flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Suspense
            fallback={<div className="py-16 text-center text-content-subtle">{t('loading')}</div>}
          >
            <Outlet />
          </Suspense>
        </main>

        <footer className="border-t border-border px-4 py-4 text-center text-xs text-content-subtle sm:px-6">
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </footer>
      </div>

      <MobileNavigation
        items={[
          {
            id: 'dashboard',
            label: tShowcase('layout.mobileNavDashboard'),
            to: '/',
            icon: <LayoutDashboard className="h-5 w-5" aria-hidden="true" />,
          },
          {
            id: 'components',
            label: tShowcase('layout.mobileNavComponents'),
            to: '/components',
            icon: <Palette className="h-5 w-5" aria-hidden="true" />,
          },
        ]}
      />
    </div>
  )
}
