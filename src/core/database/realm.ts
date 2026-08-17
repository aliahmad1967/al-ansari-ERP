/**
 * Single entry point for the Realm database engine.
 *
 * Everything database-related goes through this module so a future
 * synchronization layer (or a different runtime engine) can be swapped in
 * without touching the rest of the architecture:
 *
 *   UI → hooks → services → repositories → Realm
 *
 * The `realm` package targets Node.js and React Native. In a pure browser
 * environment there is no persistent Realm engine, so the capability check
 * below keeps the application from crashing where Realm is unavailable.
 */

import Realm from 'realm'

import { DatabaseError, DatabaseErrorCode } from './errors'

export { Realm }

export type DatabasePlatform = 'node' | 'react-native' | 'browser' | 'unknown'

export interface RealmRuntimeInfo {
  platform: DatabasePlatform
  nodeVersion?: string
}

/** True when the current runtime can host a persistent Realm instance. */
export function isRealmSupported(): boolean {
  return isNodeRuntime()
}

/** True when running inside Node.js (or a Node-powered desktop/mobile shell). */
export function isNodeRuntime(): boolean {
  return (
    typeof process !== 'undefined' &&
    typeof process.versions === 'object' &&
    !!process.versions.node
  )
}

/** Describes the runtime hosting the database. */
export function getRealmRuntimeInfo(): RealmRuntimeInfo {
  if (isNodeRuntime()) {
    return { platform: 'node', nodeVersion: process.versions.node }
  }
  if ('window' in globalThis) {
    return { platform: 'browser' }
  }
  return { platform: 'unknown' }
}

let activeRealm: Realm | null = null

/** Registers (or clears) the currently open Realm used by repositories. */
export function setActiveRealm(realm: Realm | null): void {
  activeRealm = realm
}

/** True when a Realm instance is open and usable. */
export function hasActiveRealm(): boolean {
  return activeRealm !== null && !activeRealm.isClosed
}

/**
 * Returns the active Realm instance or throws {@link DatabaseError} when the
 * database is not open.
 */
export function getActiveRealm(): Realm {
  if (activeRealm === null || activeRealm.isClosed) {
    throw new DatabaseError(
      DatabaseErrorCode.DB_NOT_OPEN,
      'The Realm database is not open. Call databaseManager.open() first.',
    )
  }
  return activeRealm
}
