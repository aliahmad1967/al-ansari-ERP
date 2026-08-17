import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { STORAGE_KEYS } from '@/config/app.config'
import arAuth from '@/i18n/ar/auth.json'
import arCommon from '@/i18n/ar/common.json'
import arDatabase from '@/i18n/ar/database.json'
import arOrganization from '@/i18n/ar/organization.json'
import arShowcase from '@/i18n/ar/showcase.json'
import arUi from '@/i18n/ar/ui.json'
import enAuth from '@/i18n/en/auth.json'
import enCommon from '@/i18n/en/common.json'
import enDatabase from '@/i18n/en/database.json'
import enOrganization from '@/i18n/en/organization.json'
import enShowcase from '@/i18n/en/showcase.json'
import enUi from '@/i18n/en/ui.json'

export const SUPPORTED_LANGUAGES = ['ar', 'en'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

export const DEFAULT_LANGUAGE: SupportedLanguage = 'ar'

function getInitialLanguage(): SupportedLanguage {
  const stored = window.localStorage.getItem(STORAGE_KEYS.language)
  if (stored === 'ar' || stored === 'en') {
    return stored
  }
  return DEFAULT_LANGUAGE
}

i18n.use(initReactI18next).init({
  resources: {
    ar: {
      auth: arAuth,
      common: arCommon,
      ui: arUi,
      showcase: arShowcase,
      database: arDatabase,
      organization: arOrganization,
    },
    en: {
      auth: enAuth,
      common: enCommon,
      ui: enUi,
      showcase: enShowcase,
      database: enDatabase,
      organization: enOrganization,
    },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'ar',
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
})

export function setLanguage(language: SupportedLanguage): void {
  void i18n.changeLanguage(language)
  window.localStorage.setItem(STORAGE_KEYS.language, language)
}

export default i18n
