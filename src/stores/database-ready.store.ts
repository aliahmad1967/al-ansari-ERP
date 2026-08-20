/**
 * Database readiness store — tracks whether the Realm database is open
 * and ready for use by the application.
 *
 * Follows the useSyncExternalStore pattern used throughout the app.
 * The database readiness state drives the AppLoading screen that appears
 * while Realm initializes on first load or after a browser restart.
 */

export interface DatabaseReadyState {
  /** True when the Realm database is open and all repositories are usable. */
  ready: boolean
  /** True when the database is currently initializing (opening). */
  initializing: boolean
  /** Error message if the database failed to open. */
  error: string | null
  /** Timestamp of the last state change. */
  lastChangedAt: number
}

const listeners = new Set<() => void>()

let state: DatabaseReadyState = {
  ready: false,
  initializing: false,
  error: null,
  lastChangedAt: Date.now(),
}

function setState(patch: Partial<DatabaseReadyState>): void {
  state = { ...state, ...patch, lastChangedAt: Date.now() }
  emit()
}

function emit(): void {
  listeners.forEach((listener) => listener())
}

/* -------------------------------------------------------------------------- */
/*  Public API                                                                */
/* -------------------------------------------------------------------------- */

export function getDatabaseReadyState(): DatabaseReadyState {
  return state
}

export function subscribeDatabaseReady(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Mark the database as initializing. */
export function markDatabaseInitializing(): void {
  setState({ initializing: true, ready: false, error: null })
}

/** Mark the database as ready (open and usable). */
export function markDatabaseReady(): void {
  setState({ initializing: false, ready: true, error: null })
}

/** Mark the database as failed to open. */
export function markDatabaseError(error: string): void {
  setState({ initializing: false, ready: false, error })
}

/** Reset the store to initial state. */
export function resetDatabaseReadyState(): void {
  setState({ ready: false, initializing: false, error: null })
}
