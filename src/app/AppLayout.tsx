import { Suspense, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useSyncExternalStore } from 'react'
import { Outlet } from 'react-router-dom'
import {
  Boxes,
  Building2,
  Briefcase,
  GitBranch,
  Languages,
  LayoutDashboard,
  Layers,
  LogOut,
  Moon,
  Palette,
  Shield,
  Sun,
  User,
  Users,
  UserCircle,
  Clock,
  Calendar,
  BarChart3,
  Calculator,
  FileText,
  Package,
  Warehouse,
  ArrowUpDown,
  Truck,
  Settings,
  ShoppingCart,
  FileCheck,
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
  const { t: tOrg } = useTranslation('organization')
  const { t: tHr } = useTranslation('hr')
  const { t: tAtt } = useTranslation('attendance')
  const { t: tInv } = useTranslation('inventory')
  const { t: tProc } = useTranslation('procurement')
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
      id: 'organization',
      label: tOrg('nav.organizationManagement'),
      items: [
        {
          id: 'organizations',
          label: tOrg('nav.organizations'),
          icon: <Building2 className="h-4 w-4" aria-hidden="true" />,
          to: '/organizations',
        },
        {
          id: 'branches',
          label: tOrg('nav.branches'),
          icon: <GitBranch className="h-4 w-4" aria-hidden="true" />,
          to: '/branches',
        },
        {
          id: 'departments',
          label: tOrg('nav.departments'),
          icon: <Layers className="h-4 w-4" aria-hidden="true" />,
          to: '/departments',
        },
        {
          id: 'positions',
          label: tOrg('nav.positions'),
          icon: <Briefcase className="h-4 w-4" aria-hidden="true" />,
          to: '/positions',
        },
        {
          id: 'users',
          label: tOrg('nav.users'),
          icon: <Users className="h-4 w-4" aria-hidden="true" />,
          to: '/users',
        },
        {
          id: 'roles',
          label: tOrg('nav.roles'),
          icon: <Shield className="h-4 w-4" aria-hidden="true" />,
          to: '/roles',
        },
        {
          id: 'permissions',
          label: tOrg('nav.permissions'),
          icon: <Shield className="h-4 w-4" aria-hidden="true" />,
          to: '/permissions',
        },
      ],
    },
    {
      id: 'hr',
      label: tHr('employee.title'),
      items: [
        {
          id: 'employees',
          label: tHr('employee.title'),
          icon: <UserCircle className="h-4 w-4" aria-hidden="true" />,
          to: '/employees',
        },
        {
          id: 'attendance',
          label: tAtt('attendance.title'),
          icon: <Clock className="h-4 w-4" aria-hidden="true" />,
          to: '/attendance',
        },
        {
          id: 'leave',
          label: tAtt('leave.title'),
          icon: <Calendar className="h-4 w-4" aria-hidden="true" />,
          to: '/leave',
        },
        {
          id: 'attendance-reports',
          label: tAtt('reports.title'),
          icon: <BarChart3 className="h-4 w-4" aria-hidden="true" />,
          to: '/attendance-reports',
        },
      ],
    },
    {
      id: 'payroll',
      label: tHr('payrollRun.title'),
      items: [
        {
          id: 'salary-structures',
          label: tHr('salaryStructure.title'),
          icon: <Layers className="h-4 w-4" aria-hidden="true" />,
          to: '/salary-structures',
        },
        {
          id: 'payroll-periods',
          label: tHr('payrollPeriod.title'),
          icon: <Calendar className="h-4 w-4" aria-hidden="true" />,
          to: '/payroll-periods',
        },
        {
          id: 'payroll',
          label: tHr('payrollRun.title'),
          icon: <Calculator className="h-4 w-4" aria-hidden="true" />,
          to: '/payroll',
        },
        {
          id: 'payslips',
          label: tHr('payslip.title'),
          icon: <FileText className="h-4 w-4" aria-hidden="true" />,
          to: '/payslips',
        },
      ],
    },
    {
      id: 'inventory',
      label: tInv('nav.inventoryManagement'),
      items: [
        {
          id: 'products',
          label: tInv('nav.products'),
          icon: <Package className="h-4 w-4" aria-hidden="true" />,
          to: '/products',
        },
        {
          id: 'categories',
          label: tInv('nav.categories'),
          icon: <Layers className="h-4 w-4" aria-hidden="true" />,
          to: '/categories',
        },
        {
          id: 'warehouses',
          label: tInv('nav.warehouses'),
          icon: <Warehouse className="h-4 w-4" aria-hidden="true" />,
          to: '/warehouses',
        },
        {
          id: 'stock',
          label: tInv('stockBalance.title'),
          icon: <Boxes className="h-4 w-4" aria-hidden="true" />,
          to: '/stock',
        },
        {
          id: 'stock-movements',
          label: tInv('nav.stockMovements'),
          icon: <ArrowUpDown className="h-4 w-4" aria-hidden="true" />,
          to: '/stock-movements',
        },
        {
          id: 'stock-transfers',
          label: tInv('nav.stockTransfers'),
          icon: <Truck className="h-4 w-4" aria-hidden="true" />,
          to: '/stock-transfers',
        },
        {
          id: 'stock-adjustments',
          label: tInv('nav.stockAdjustments'),
          icon: <Settings className="h-4 w-4" aria-hidden="true" />,
          to: '/stock-adjustments',
        },
        {
          id: 'inventory-reports',
          label: tInv('reports.title'),
          icon: <BarChart3 className="h-4 w-4" aria-hidden="true" />,
          to: '/inventory-reports',
        },
      ],
    },
    {
      id: 'procurement',
      label: tProc('nav.procurementManagement'),
      items: [
        {
          id: 'suppliers',
          label: tProc('nav.suppliers'),
          icon: <Building2 className="h-4 w-4" aria-hidden="true" />,
          to: '/suppliers',
        },
        {
          id: 'purchase-requests',
          label: tProc('nav.purchaseRequests'),
          icon: <FileText className="h-4 w-4" aria-hidden="true" />,
          to: '/purchase-requests',
        },
        {
          id: 'purchase-orders',
          label: tProc('nav.purchaseOrders'),
          icon: <ShoppingCart className="h-4 w-4" aria-hidden="true" />,
          to: '/purchase-orders',
        },
        {
          id: 'goods-receipts',
          label: tProc('nav.goodsReceipts'),
          icon: <Package className="h-4 w-4" aria-hidden="true" />,
          to: '/goods-receipts',
        },
        {
          id: 'supplier-invoices',
          label: tProc('nav.supplierInvoices'),
          icon: <FileCheck className="h-4 w-4" aria-hidden="true" />,
          to: '/supplier-invoices',
        },
        {
          id: 'procurement-reports',
          label: tProc('nav.procurementReports'),
          icon: <BarChart3 className="h-4 w-4" aria-hidden="true" />,
          to: '/procurement-reports',
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
            id: 'organizations',
            label: tOrg('nav.organizations'),
            to: '/organizations',
            icon: <Building2 className="h-5 w-5" aria-hidden="true" />,
          },
          {
            id: 'users',
            label: tOrg('nav.users'),
            to: '/users',
            icon: <Users className="h-5 w-5" aria-hidden="true" />,
          },
        ]}
      />
    </div>
  )
}
