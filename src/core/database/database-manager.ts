/**
 * DatabaseManager — singleton lifecycle owner of the Realm database.
 *
 * Responsibilities:
 *  - safe asynchronous open / idempotent close
 *  - backup / restore and full JSON export
 *  - development-only reset with a hard production guard
 *  - status reporting for UI and diagnostics
 *
 * Repositories never open the database themselves; they read it through
 * {@link getActiveRealm} which this manager populates on open.
 */

import fs from 'node:fs'
import path from 'node:path'

import Realm from 'realm'

import { DatabaseError, DatabaseErrorCode, errorMessage } from './errors'
import {
  buildDatabaseConfig,
  getDataDirectory,
  getDefaultDatabasePath,
  type DatabaseConfigOptions,
} from './realm.config'
import {
  getRealmRuntimeInfo,
  isRealmSupported,
  setActiveRealm,
  type DatabasePlatform,
} from './realm'
import { seedDatabase, type SeedResult } from './seed'

/** Token required to confirm a destructive database reset. */
export const RESET_CONFIRMATION_TOKEN = 'RESET'

export interface OpenDatabaseOptions extends DatabaseConfigOptions {
  /** Seed default data when the database is empty (skipped in production). */
  seed?: boolean
}

export interface ResetDatabaseOptions {
  /** Must equal {@link RESET_CONFIRMATION_TOKEN}. */
  confirm: string
  /** Bypasses the production guard (used by explicit tooling only). */
  allowInProduction?: boolean
}

export interface DatabaseStatus {
  isOpen: boolean
  path: string | null
  schemaVersion: number | null
  fileExists: boolean
  sizeBytes: number
  platform: DatabasePlatform
}

export class DatabaseManager {
  private static instance: DatabaseManager | null = null

  private realmInstance: Realm | null = null
  private openPromise: Promise<Realm> | null = null
  private openConfig: Realm.Configuration | null = null
  private lastSeedResult: SeedResult | null = null

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager()
    }
    return DatabaseManager.instance
  }

  /** True when a Realm instance is open and usable. */
  get isOpen(): boolean {
    return this.realmInstance !== null && !this.realmInstance.isClosed
  }

  /** Path of the open database, if any. */
  get path(): string | null {
    return this.realmInstance?.path ?? null
  }

  /** Schema version of the open database, if any. */
  get schemaVersion(): number | null {
    return this.isOpen ? this.realmInstance!.schemaVersion : null
  }

  /** Result of the last seeding attempt. */
  get seedResult(): SeedResult | null {
    return this.lastSeedResult
  }

  /**
   * Opens the database (idempotent). When a write is already in progress the
   * same promise is returned. Throws a typed {@link DatabaseError} when the
   * environment cannot host Realm or the file cannot be opened.
   */
  open(options: OpenDatabaseOptions = {}): Promise<Realm> {
    if (this.isOpen && this.realmInstance) {
      return Promise.resolve(this.realmInstance)
    }
    if (this.openPromise) {
      return this.openPromise
    }
    this.openPromise = this.doOpen(options).finally(() => {
      this.openPromise = null
    })
    return this.openPromise
  }

  private async doOpen(options: OpenDatabaseOptions): Promise<Realm> {
    if (!isRealmSupported()) {
      throw new DatabaseError(
        DatabaseErrorCode.DB_UNSUPPORTED_ENVIRONMENT,
        'Realm is not supported in this environment. It requires a Node.js runtime.',
        { context: { path: options.path ?? getDefaultDatabasePath() } },
      )
    }

    const config = buildDatabaseConfig(options)

    try {
      const realm = await Realm.open(config)
      this.realmInstance = realm
      this.openConfig = config
      setActiveRealm(realm)

      const wantSeed =
        options.seed === true || (options.seed !== false && process.env.NODE_ENV !== 'production')
      if (wantSeed) {
        this.lastSeedResult = seedDatabase(realm)
      }
      return realm
    } catch (error) {
      setActiveRealm(null)
      this.realmInstance = null
      this.openConfig = null
      throw new DatabaseError(
        DatabaseErrorCode.DB_OPEN_FAILED,
        `Failed to open the database at "${config.path}". ${errorMessage(error)}`,
        { cause: error, context: { operation: 'database.open', path: config.path } },
      )
    }
  }

  /** Closes the database. Idempotent and safe to call repeatedly. */
  close(): void {
    if (this.realmInstance && !this.realmInstance.isClosed) {
      try {
        this.realmInstance.close()
      } catch (error) {
        throw new DatabaseError(
          DatabaseErrorCode.DB_CLOSE_FAILED,
          `Failed to close the database. ${errorMessage(error)}`,
          { cause: error, context: { operation: 'database.close', path: this.realmInstance.path } },
        )
      }
    }
    this.realmInstance = null
    this.openConfig = null
    setActiveRealm(null)
  }

  /** The open Realm instance (throws when not open). */
  getRealm(): Realm {
    if (!this.isOpen || !this.realmInstance) {
      throw new DatabaseError(
        DatabaseErrorCode.DB_NOT_OPEN,
        'The database is not open. Call databaseManager.open() first.',
        { context: { operation: 'database.getRealm' } },
      )
    }
    return this.realmInstance
  }

  /** Default backup directory under the data directory. */
  getBackupsDirectory(): string {
    const directory = path.join(getDataDirectory(), 'backups')
    fs.mkdirSync(directory, { recursive: true })
    return directory
  }

  /** Default export directory under the data directory. */
  getExportsDirectory(): string {
    const directory = path.join(getDataDirectory(), 'exports')
    fs.mkdirSync(directory, { recursive: true })
    return directory
  }

  /**
   * Writes a consistent snapshot of the open database to `targetPath`
   * (defaults to a timestamped file under the backups directory).
   */
  backup(targetPath?: string): string {
    const realm = this.getRealm()
    const destination =
      targetPath ?? this.buildTimestampedPath(this.getBackupsDirectory(), 'backup', '.realm')
    const directory = path.dirname(destination)
    fs.mkdirSync(directory, { recursive: true })

    try {
      realm.writeCopyTo({ path: destination, schemaVersion: realm.schemaVersion })
    } catch (error) {
      throw new DatabaseError(
        DatabaseErrorCode.DB_BACKUP_FAILED,
        `Failed to back up the database to "${destination}". ${errorMessage(error)}`,
        { cause: error, context: { operation: 'database.backup', path: destination } },
      )
    }
    return destination
  }

  /**
   * Exports every record of every installed object type to a JSON string.
   * Safe for offline export and future synchronization seeding.
   */
  exportJson(): string {
    const realm = this.getRealm()
    try {
      const dump: Record<string, unknown[]> = {}
      for (const schema of realm.schema) {
        const records = realm.objects(schema.name)
        dump[schema.name] = Array.from(records).map((record) => record.toJSON())
      }
      return JSON.stringify(
        { exportedAt: new Date().toISOString(), schemaVersion: realm.schemaVersion, data: dump },
        null,
        2,
      )
    } catch (error) {
      throw new DatabaseError(
        DatabaseErrorCode.DB_EXPORT_FAILED,
        `Failed to export the database. ${errorMessage(error)}`,
        { cause: error, context: { operation: 'database.export', path: realm.path } },
      )
    }
  }

  /** Writes the JSON export to a file and returns its path. */
  exportToFile(targetPath?: string): string {
    const destination =
      targetPath ?? this.buildTimestampedPath(this.getExportsDirectory(), 'export', '.json')
    const directory = path.dirname(destination)
    fs.mkdirSync(directory, { recursive: true })
    fs.writeFileSync(destination, this.exportJson(), 'utf8')
    return destination
  }

  /**
   * Restores the database from a backup file: closes the current instance,
   * replaces the database file and reopens it.
   */
  restore(sourcePath: string): Promise<Realm> {
    const currentPath = this.openConfig?.path ?? getDefaultDatabasePath()
    if (!fs.existsSync(sourcePath)) {
      throw new DatabaseError(
        DatabaseErrorCode.DB_RESTORE_FAILED,
        `Backup file not found at "${sourcePath}".`,
        { context: { operation: 'database.restore', path: sourcePath } },
      )
    }
    try {
      this.close()
      fs.copyFileSync(sourcePath, currentPath)
    } catch (error) {
      throw new DatabaseError(
        DatabaseErrorCode.DB_RESTORE_FAILED,
        `Failed to restore the database from "${sourcePath}". ${errorMessage(error)}`,
        { cause: error, context: { operation: 'database.restore', path: sourcePath } },
      )
    }
    return this.open()
  }

  /**
   * Resets (deletes) the database.
   *
   * Hard guards:
   *  - blocked in production unless `allowInProduction` is set explicitly,
   *  - requires {@link RESET_CONFIRMATION_TOKEN} as confirmation.
   */
  reset(options: ResetDatabaseOptions): void {
    this.assertCanReset(options)

    const config = this.openConfig ?? buildDatabaseConfig()
    this.close()
    try {
      Realm.deleteFile(config)
    } catch (error) {
      throw new DatabaseError(
        DatabaseErrorCode.DB_DELETE_FAILED,
        `Failed to delete the database file. ${errorMessage(error)}`,
        { cause: error, context: { operation: 'database.reset', path: config.path } },
      )
    }
    this.lastSeedResult = null
  }

  private assertCanReset(options: ResetDatabaseOptions): void {
    if (options.confirm !== RESET_CONFIRMATION_TOKEN) {
      throw new DatabaseError(
        DatabaseErrorCode.DB_RESET_BLOCKED,
        'Destructive database reset requires the confirmation token.',
        { context: { operation: 'database.reset' } },
      )
    }
    const isProduction = process.env.NODE_ENV === 'production'
    if (isProduction && !options.allowInProduction) {
      throw new DatabaseError(
        DatabaseErrorCode.DB_RESET_BLOCKED,
        'Destructive database reset is disabled in production.',
        { context: { operation: 'database.reset' } },
      )
    }
  }

  /** Current database status for diagnostics. */
  status(): DatabaseStatus {
    const databasePath = this.openConfig?.path ?? getDefaultDatabasePath()
    let fileExists = false
    let sizeBytes = 0
    if (fs.existsSync(databasePath)) {
      fileExists = true
      sizeBytes = fs.statSync(databasePath).size
    }
    return {
      isOpen: this.isOpen,
      path: this.isOpen ? this.path : databasePath,
      schemaVersion: this.schemaVersion,
      fileExists,
      sizeBytes,
      platform: getRealmRuntimeInfo().platform,
    }
  }

  private buildTimestampedPath(directory: string, prefix: string, extension: string): string {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    return path.join(directory, `${prefix}-${stamp}${extension}`)
  }
}

/** Shared singleton instance used across the application. */
export const databaseManager = DatabaseManager.getInstance()
