import type { RouteObject } from 'react-router-dom'

import AppLayout from '@/app/AppLayout'
import HomePage from '@/app/HomePage'
import ComponentShowcase from '@/app/showcase/ComponentShowcase'
import NotFoundPage from '@/app/NotFoundPage'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import LoginPage from '@/modules/auth/pages/LoginPage'
import ChangePasswordPage from '@/modules/auth/pages/ChangePasswordPage'

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
