import { useSyncExternalStore } from 'react'

import {
  getDatabaseReadyState,
  subscribeDatabaseReady,
  type DatabaseReadyState,
} from '@/stores/database-ready.store'

/**
 * React hook that exposes the database readiness state.
 *
 * Used by the AppLoading component to show a loading screen while
 * Realm initializes. The database is ready when the DatabaseManager
 * has successfully opened the Realm instance.
 */
export function useDatabaseReady(): DatabaseReadyState {
  return useSyncExternalStore(subscribeDatabaseReady, getDatabaseReadyState)
}
