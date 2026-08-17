import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { appRoutes } from '@/app/routes'

const router = createBrowserRouter(appRoutes)

export default function AppRouter() {
  return <RouterProvider router={router} />
}
