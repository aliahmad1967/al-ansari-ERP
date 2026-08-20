import { useEffect, type PropsWithChildren } from 'react'

import ToastProvider from '@/components/ui/Toast'
import i18n from '@/i18n/i18n'
import { registerServiceWorker } from '@/lib/service-worker'
import {
  markDatabaseInitializing,
  markDatabaseReady,
  markDatabaseError,
} from '@/stores/database-ready.store'
import { isRealmSupported } from '@/core/database/realm'

function applyDocumentLanguage(language: string): void {
  document.documentElement.lang = language
  document.documentElement.dir = language.startsWith('ar') ? 'rtl' : 'ltr'
}

/**
 * Initializes the Realm database on app startup.
 *
 * If the runtime supports Realm (Node.js/Electron), the database is opened
 * and the readiness store is updated. If the runtime is a browser without
 * Realm support, the database is marked as ready immediately — the app
 * can still function with seed data or empty state.
 */
async function initializeDatabase(): Promise<void> {
  markDatabaseInitializing()

  try {
    if (!isRealmSupported()) {
      // Browser environment without Realm — mark as ready immediately.
      // The app can function with seed data or empty state.
      markDatabaseReady()
      return
    }

    // Dynamically import databaseManager to avoid loading Realm
    // in environments where it's not available.
    const { databaseManager } = await import('@/core/database/database-manager')
    await databaseManager.open()
    markDatabaseReady()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error'
    console.error('[AppProviders] Database initialization failed:', message)
    markDatabaseError(message)
  }
}

export default function AppProviders({ children }: PropsWithChildren) {
  useEffect(() => {
    applyDocumentLanguage(i18n.resolvedLanguage ?? i18n.language)

    const handleLanguageChanged = (language: string): void => {
      applyDocumentLanguage(language)
    }

    i18n.on('languageChanged', handleLanguageChanged)

    // Register the service worker for offline-first PWA support
    void registerServiceWorker()

    // Initialize the Realm database for offline-first data persistence
    void initializeDatabase()

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
