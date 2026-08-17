/**
 * Database layer barrel.
 */

export { databaseManager, DatabaseManager, RESET_CONFIRMATION_TOKEN } from './database-manager'
export type { DatabaseStatus, OpenDatabaseOptions, ResetDatabaseOptions } from './database-manager'

export { DatabaseError, DatabaseErrorCode, errorMessage, isDatabaseError } from './errors'
export type { DatabaseErrorContext, DatabaseErrorCodeValue, DatabaseErrorOptions } from './errors'

export { CURRENT_SCHEMA_VERSION, MIGRATIONS, requiresMigration } from './migrations'

export {
  getActiveRealm,
  getRealmRuntimeInfo,
  hasActiveRealm,
  isNodeRuntime,
  isRealmSupported,
  setActiveRealm,
  Realm,
} from './realm'
export type { DatabasePlatform } from './realm'

export { buildDatabaseConfig, getDataDirectory, getDefaultDatabasePath } from './realm.config'
export type { DatabaseConfigOptions } from './realm.config'

export { seedDatabase } from './seed'
export type { SeedResult, SeedSummary } from './seed'

export { isWriteTransactionActive, withTransaction } from './transactions'
