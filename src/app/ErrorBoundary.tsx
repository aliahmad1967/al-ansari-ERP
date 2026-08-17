import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

interface ErrorFallbackProps {
  onReload: () => void
}

function ErrorFallback({ onReload }: ErrorFallbackProps) {
  const { t } = useTranslation('common')

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface p-4">
      <section className="w-full max-w-md rounded-lg border border-border bg-surface-raised p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-content">{t('errorBoundary.title')}</h1>
        <p className="mt-3 text-content-muted">{t('errorBoundary.message')}</p>
        <button
          type="button"
          onClick={onReload}
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-content transition-colors duration-150 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          {t('errorBoundary.reload')}
        </button>
      </section>
    </main>
  )
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Unhandled application error:', error, errorInfo)
  }

  private handleReload = (): void => {
    window.location.reload()
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <ErrorFallback onReload={this.handleReload} />
    }
    return this.props.children
  }
}
