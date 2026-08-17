import { useSyncExternalStore } from 'react'

import type { SupportedLanguage } from '@/i18n/i18n'
import {
  getLanguage,
  setLanguage,
  subscribeLanguage,
  toggleLanguage,
} from '@/stores/language.store'

export interface UseLanguageResult {
  language: SupportedLanguage
  isRTL: boolean
  setLanguage: (language: SupportedLanguage) => void
  toggleLanguage: () => void
}

export function useLanguage(): UseLanguageResult {
  const language = useSyncExternalStore(subscribeLanguage, getLanguage)

  return {
    language,
    isRTL: language === 'ar',
    setLanguage,
    toggleLanguage,
  }
}
