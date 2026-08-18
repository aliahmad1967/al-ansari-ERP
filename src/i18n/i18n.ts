import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { STORAGE_KEYS } from '@/config/app.config'
import arAuth from '@/i18n/ar/auth.json'
import arCommon from '@/i18n/ar/common.json'
import arDashboard from '@/i18n/ar/dashboard.json'
import arDatabase from '@/i18n/ar/database.json'
import arOrganization from '@/i18n/ar/organization.json'
import arShowcase from '@/i18n/ar/showcase.json'
import arHr from '@/i18n/ar/hr.json'
import arAttendance from '@/i18n/ar/attendance.json'
import arUi from '@/i18n/ar/ui.json'
import arInventory from '@/i18n/ar/inventory.json'
import arProcurement from '@/i18n/ar/procurement.json'
import arFinance from '@/i18n/ar/finance.json'
import arReports from '@/i18n/ar/reports.json'
import arSales from '@/i18n/ar/sales.json'
import arAccounting from '@/i18n/ar/accounting.json'
import arProjects from '@/i18n/ar/projects.json'
import enAuth from '@/i18n/en/auth.json'
import enCommon from '@/i18n/en/common.json'
import enDashboard from '@/i18n/en/dashboard.json'
import enDatabase from '@/i18n/en/database.json'
import enOrganization from '@/i18n/en/organization.json'
import enShowcase from '@/i18n/en/showcase.json'
import enHr from '@/i18n/en/hr.json'
import enAttendance from '@/i18n/en/attendance.json'
import enUi from '@/i18n/en/ui.json'
import enInventory from '@/i18n/en/inventory.json'
import enProcurement from '@/i18n/en/procurement.json'
import enFinance from '@/i18n/en/finance.json'
import enReports from '@/i18n/en/reports.json'
import enSales from '@/i18n/en/sales.json'
import enAccounting from '@/i18n/en/accounting.json'
import enProjects from '@/i18n/en/projects.json'

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
      dashboard: arDashboard,
      ui: arUi,
      showcase: arShowcase,
      database: arDatabase,
      organization: arOrganization,
      hr: arHr,
      attendance: arAttendance,
      inventory: arInventory,
      procurement: arProcurement,
      finance: arFinance,
      reports: arReports,
      sales: arSales,
      accounting: arAccounting,
      projects: arProjects,
    },
    en: {
      auth: enAuth,
      common: enCommon,
      dashboard: enDashboard,
      ui: enUi,
      showcase: enShowcase,
      database: enDatabase,
      organization: enOrganization,
      hr: enHr,
      attendance: enAttendance,
      inventory: enInventory,
      procurement: enProcurement,
      finance: enFinance,
      reports: enReports,
      sales: enSales,
      accounting: enAccounting,
      projects: enProjects,
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
