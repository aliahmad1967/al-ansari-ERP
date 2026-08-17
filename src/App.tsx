import AppRouter from '@/app/AppRouter'
import ErrorBoundary from '@/app/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  )
}
