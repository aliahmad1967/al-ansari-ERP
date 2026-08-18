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
const SuppliersPage = lazy(() => import('@/modules/procurement/pages/Suppliers'))
const PurchaseRequestsPage = lazy(() => import('@/modules/procurement/pages/PurchaseRequests'))
const PurchaseOrdersPage = lazy(() => import('@/modules/procurement/pages/PurchaseOrders'))
const GoodsReceiptsPage = lazy(() => import('@/modules/procurement/pages/GoodsReceipts'))
const SupplierInvoicesPage = lazy(() => import('@/modules/procurement/pages/SupplierInvoices'))
const ProcurementReportsPage = lazy(() => import('@/modules/procurement/pages/ProcurementReports'))
const CustomersPage = lazy(() => import('@/modules/sales/pages/Customers'))
const QuotationsPage = lazy(() => import('@/modules/sales/pages/Quotations'))
const SalesOrdersPage = lazy(() => import('@/modules/sales/pages/SalesOrders'))
const DeliveriesPage = lazy(() => import('@/modules/sales/pages/Deliveries'))
const SalesInvoicesPage = lazy(() => import('@/modules/sales/pages/Invoices'))
const CustomerPaymentsPage = lazy(() => import('@/modules/sales/pages/Payments'))
const SalesReturnsPage = lazy(() => import('@/modules/sales/pages/SalesReturns'))

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

          // Procurement Management
          { path: 'suppliers', element: <SuppliersPage /> },
          { path: 'purchase-requests', element: <PurchaseRequestsPage /> },
          { path: 'purchase-orders', element: <PurchaseOrdersPage /> },
          { path: 'goods-receipts', element: <GoodsReceiptsPage /> },
          { path: 'supplier-invoices', element: <SupplierInvoicesPage /> },
          { path: 'procurement-reports', element: <ProcurementReportsPage /> },

          // Sales Management
          { path: 'customers', element: <CustomersPage /> },
          { path: 'quotations', element: <QuotationsPage /> },
          { path: 'sales-orders', element: <SalesOrdersPage /> },
          { path: 'deliveries', element: <DeliveriesPage /> },
          { path: 'sales-invoices', element: <SalesInvoicesPage /> },
          { path: 'customer-payments', element: <CustomerPaymentsPage /> },
          { path: 'sales-returns', element: <SalesReturnsPage /> },
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
