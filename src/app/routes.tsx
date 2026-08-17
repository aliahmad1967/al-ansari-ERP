import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

import AppLayout from '@/app/AppLayout'
import HomePage from '@/app/HomePage'
import ComponentShowcase from '@/app/showcase/ComponentShowcase'
import NotFoundPage from '@/app/NotFoundPage'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import LoginPage from '@/modules/auth/pages/LoginPage'
import ChangePasswordPage from '@/modules/auth/pages/ChangePasswordPage'

const DashboardPage = lazy(() => import('@/modules/dashboard/pages/Dashboard'))
const OrganizationsPage = lazy(() => import('@/modules/organization/pages/Organizations'))
const BranchesPage = lazy(() => import('@/modules/organization/pages/Branches'))
const DepartmentsPage = lazy(() => import('@/modules/organization/pages/Departments'))
const PositionsPage = lazy(() => import('@/modules/organization/pages/Positions'))
const UsersPage = lazy(() => import('@/modules/organization/pages/Users'))
const RolesPage = lazy(() => import('@/modules/organization/pages/Roles'))
const PermissionsPage = lazy(() => import('@/modules/organization/pages/Permissions'))
const EmployeesPage = lazy(() => import('@/modules/hr/pages/Employees'))
const EmployeeDetailsPage = lazy(() => import('@/modules/hr/pages/EmployeeDetails'))
const AttendancePage = lazy(() => import('@/modules/attendance/pages/Attendance'))
const LeavePage = lazy(() => import('@/modules/attendance/pages/Leave'))
const AttendanceReportsPage = lazy(() => import('@/modules/attendance/pages/Reports'))
const SalaryStructuresPage = lazy(() => import('@/modules/hr/pages/SalaryStructures'))
const PayrollPeriodsPage = lazy(() => import('@/modules/hr/pages/PayrollPeriods'))
const PayrollRunsPage = lazy(() => import('@/modules/hr/pages/Payroll'))
const PayslipsPage = lazy(() => import('@/modules/hr/pages/Payslips'))
const ProductsPage = lazy(() => import('@/modules/inventory/pages/Products'))
const WarehousesPage = lazy(() => import('@/modules/inventory/pages/Warehouses'))
const CategoriesPage = lazy(() => import('@/modules/inventory/pages/Categories'))
const StockPage = lazy(() => import('@/modules/inventory/pages/Stock'))
const StockMovementsPage = lazy(() => import('@/modules/inventory/pages/StockMovements'))
const TransfersPage = lazy(() => import('@/modules/inventory/pages/Transfers'))
const AdjustmentsPage = lazy(() => import('@/modules/inventory/pages/Adjustments'))
const InventoryReportsPage = lazy(() => import('@/modules/inventory/pages/Reports'))

export const appRoutes: RouteObject[] = [
  // Public routes (guest only)
  {
    element: <ProtectedRoute requireGuest />,
    children: [
      { path: '/login', element: <LoginPage /> },
    ],
  },

  // Protected routes (require authentication)
  {
    element: <ProtectedRoute requireAuth />,
    children: [
      {
        path: '/change-password',
        element: <ChangePasswordPage />,
      },
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'components', element: <ComponentShowcase /> },

          // Organization Management
          { path: 'organizations', element: <OrganizationsPage /> },
          { path: 'branches', element: <BranchesPage /> },
          { path: 'departments', element: <DepartmentsPage /> },
          { path: 'positions', element: <PositionsPage /> },
          { path: 'users', element: <UsersPage /> },
          { path: 'roles', element: <RolesPage /> },
          { path: 'permissions', element: <PermissionsPage /> },

          // HR Management
          { path: 'employees', element: <EmployeesPage /> },
          { path: 'employees/:id', element: <EmployeeDetailsPage /> },

          // Attendance & Leave
          { path: 'attendance', element: <AttendancePage /> },
          { path: 'leave', element: <LeavePage /> },
          { path: 'attendance-reports', element: <AttendanceReportsPage /> },

          // Payroll
          { path: 'salary-structures', element: <SalaryStructuresPage /> },
          { path: 'payroll-periods', element: <PayrollPeriodsPage /> },
          { path: 'payroll', element: <PayrollRunsPage /> },
          { path: 'payslips', element: <PayslipsPage /> },

          // Inventory Management
          { path: 'products', element: <ProductsPage /> },
          { path: 'categories', element: <CategoriesPage /> },
          { path: 'warehouses', element: <WarehousesPage /> },
          { path: 'stock', element: <StockPage /> },
          { path: 'stock-movements', element: <StockMovementsPage /> },
          { path: 'stock-transfers', element: <TransfersPage /> },
          { path: 'stock-adjustments', element: <AdjustmentsPage /> },
          { path: 'inventory-reports', element: <InventoryReportsPage /> },
        ],
      },
    ],
  },

  // Fallback
  {
    path: '*',
    element: <NotFoundPage />,
  },
]
