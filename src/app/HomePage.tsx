import { useTranslation } from 'react-i18next'

export default function HomePage() {
  const { t } = useTranslation('common')

  return (
    <section className="mx-auto max-w-3xl py-12 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-content">{t('home.welcome')}</h1>
      <p className="mt-4 text-content-muted">{t('home.tagline')}</p>
    </section>
  )
}
