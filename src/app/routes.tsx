import type { RouteObject } from 'react-router-dom'

import AppLayout from '@/app/AppLayout'
import HomePage from '@/app/HomePage'
import ComponentShowcase from '@/app/showcase/ComponentShowcase'
import NotFoundPage from '@/app/NotFoundPage'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import LoginPage from '@/modules/auth/pages/LoginPage'
import ChangePasswordPage from '@/modules/auth/pages/ChangePasswordPage'
import { OrganizationsPage } from '@/modules/organization'
import { BranchesPage } from '@/modules/organization'
import { DepartmentsPage } from '@/modules/organization'
import { PositionsPage } from '@/modules/organization'
import { UsersPage } from '@/modules/organization'
import { RolesPage } from '@/modules/organization'
import { PermissionsPage } from '@/modules/organization'

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
          { path: 'components', element: <ComponentShowcase /> },

          // Organization Management
          { path: 'organizations', element: <OrganizationsPage /> },
          { path: 'branches', element: <BranchesPage /> },
          { path: 'departments', element: <DepartmentsPage /> },
          { path: 'positions', element: <PositionsPage /> },
          { path: 'users', element: <UsersPage /> },
          { path: 'roles', element: <RolesPage /> },
          { path: 'permissions', element: <PermissionsPage /> },
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
