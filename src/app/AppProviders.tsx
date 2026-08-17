import { useEffect, type PropsWithChildren } from 'react'

import ToastProvider from '@/components/ui/Toast'
import i18n from '@/i18n/i18n'

function applyDocumentLanguage(language: string): void {
  document.documentElement.lang = language
  document.documentElement.dir = language.startsWith('ar') ? 'rtl' : 'ltr'
}

export default function AppProviders({ children }: PropsWithChildren) {
  useEffect(() => {
    applyDocumentLanguage(i18n.resolvedLanguage ?? i18n.language)

    const handleLanguageChanged = (language: string): void => {
      applyDocumentLanguage(language)
    }

    i18n.on('languageChanged', handleLanguageChanged)
    return () => {
      i18n.off('languageChanged', handleLanguageChanged)
    }
  }, [])

  return (
    <>
      {children}
      <ToastProvider />
    </>
  )
}
