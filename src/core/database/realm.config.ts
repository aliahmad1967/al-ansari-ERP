/**
 * Database configuration — paths, schema installation, compaction and
 * migration wiring.
 */

import fs from 'node:fs'
import path from 'node:path'

import type Realm from 'realm'

import { MODEL_CLASSES } from '../models'
import { isNodeRuntime } from './realm'
import { CURRENT_SCHEMA_VERSION, buildMigrationCallback } from './migrations'

export { CURRENT_SCHEMA_VERSION }

export const DEFAULT_DATABASE_FILE_NAME = 'al-ansari.realm'
export const DATA_DIRECTORY_NAME = 'data'

/** Size above which the Realm is considered for compaction on open. */
const COMPACTION_TRIGGER_BYTES = 50 * 1024 * 1024
/** Free-space ratio that triggers compaction. */
const COMPACTION_MIN_FREE_RATIO = 0.5

/** Absolute path of the data directory (browser-safe fallback). */
export function getDataDirectory(): string {
  if (!isNodeRuntime()) return DATA_DIRECTORY_NAME
  return path.resolve(process.cwd(), DATA_DIRECTORY_NAME)
}

/** Default on-disk database path. Creates the data directory when needed. */
export function getDefaultDatabasePath(): string {
  const directory = getDataDirectory()
  if (isNodeRuntime()) {
    fs.mkdirSync(directory, { recursive: true })
  }
  return path.join(directory, DEFAULT_DATABASE_FILE_NAME)
}

export interface DatabaseConfigOptions {
  /** Overrides the default database file location. */
  path?: string
  /** Opens an in-memory database (testing only). */
  inMemory?: boolean
  /** Deletes the file instead of migrating when the schema is outdated. */
  deleteRealmIfMigrationNeeded?: boolean
  /** 64-byte encryption key for the Realm file. */
  encryptionKey?: ArrayBuffer | ArrayBufferView
}

/**
 * Builds the complete {@link Realm.Configuration} for this application,
 * including the installed schema, current version and migration callback.
 *
 * `onMigration` and `deleteRealmIfMigrationNeeded` are mutually exclusive in
 * Realm, so the migration callback is only installed when the caller did not
 * request the delete-on-migration behavior (used by test databases).
 */
export function buildDatabaseConfig(options: DatabaseConfigOptions = {}): Realm.Configuration {
  const databasePath = options.path ?? getDefaultDatabasePath()

  if (isNodeRuntime()) {
    fs.mkdirSync(path.dirname(databasePath), { recursive: true })
  }

  const config: Realm.Configuration = {
    schema: MODEL_CLASSES,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    path: databasePath,
    inMemory: options.inMemory ?? false,
    deleteRealmIfMigrationNeeded: options.deleteRealmIfMigrationNeeded ?? false,
    encryptionKey: options.encryptionKey,
    shouldCompact: (totalBytes, usedBytes) =>
      totalBytes > COMPACTION_TRIGGER_BYTES && usedBytes / totalBytes < COMPACTION_MIN_FREE_RATIO,
  }
  if (!options.deleteRealmIfMigrationNeeded) {
    config.onMigration = buildMigrationCallback()
  }
  return config
}
