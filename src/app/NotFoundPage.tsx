import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  const { t } = useTranslation('common')

  return (
    <section className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center p-6 text-center">
      <p className="text-5xl font-bold text-content">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-content">{t('notFound.title')}</h1>
      <p className="mt-2 text-content-muted">{t('notFound.message')}</p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-content transition-colors duration-150 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      >
        {t('notFound.goHome')}
      </Link>
    </section>
  )
}
