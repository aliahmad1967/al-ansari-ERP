import i18n, { setLanguage as changeI18nLanguage, type SupportedLanguage } from '@/i18n/i18n'

const listeners = new Set<() => void>()

export function getLanguage(): SupportedLanguage {
  const resolved = i18n.resolvedLanguage
  return resolved === 'ar' ? 'ar' : 'en'
}

export function setLanguage(language: SupportedLanguage): void {
  changeI18nLanguage(language)
}

export function toggleLanguage(): void {
  setLanguage(getLanguage() === 'ar' ? 'en' : 'ar')
}

export function subscribeLanguage(listener: () => void): () => void {
  listeners.add(listener)
  i18n.on('languageChanged', listener)
  return () => {
    listeners.delete(listener)
    i18n.off('languageChanged', listener)
  }
}
