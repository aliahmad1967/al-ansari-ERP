/**
 * Centralized error handling for the database layer.
 *
 * Every database and business operation throws a typed {@link DatabaseError}
 * carrying a stable machine-readable {@link DatabaseErrorCode}. UI layers map
 * codes to translated messages; technical details stay in the error context for
 * safe logging (never passwords, tokens or secrets).
 */

export const DatabaseErrorCode = {
  /** The database has not been opened yet. */
  DB_NOT_OPEN: 'DB_NOT_OPEN',
  /** The current environment cannot host a Realm instance. */
  DB_UNSUPPORTED_ENVIRONMENT: 'DB_UNSUPPORTED_ENVIRONMENT',
  /** The database could not be opened. */
  DB_OPEN_FAILED: 'DB_OPEN_FAILED',
  /** The database could not be closed cleanly. */
  DB_CLOSE_FAILED: 'DB_CLOSE_FAILED',
  /** A database instance is already open and cannot be re-opened. */
  DB_ALREADY_OPEN: 'DB_ALREADY_OPEN',
  /** A requested record does not exist. */
  DB_NOT_FOUND: 'DB_NOT_FOUND',
  /** A record with the same primary key or unique field already exists. */
  DB_DUPLICATE: 'DB_DUPLICATE',
  /** Input failed validation. */
  DB_VALIDATION_FAILED: 'DB_VALIDATION_FAILED',
  /** A write transaction failed and was rolled back. */
  DB_TRANSACTION_FAILED: 'DB_TRANSACTION_FAILED',
  /** A schema migration failed. */
  DB_MIGRATION_FAILED: 'DB_MIGRATION_FAILED',
  /** Creating a backup failed. */
  DB_BACKUP_FAILED: 'DB_BACKUP_FAILED',
  /** Restoring from a backup failed. */
  DB_RESTORE_FAILED: 'DB_RESTORE_FAILED',
  /** Exporting data failed. */
  DB_EXPORT_FAILED: 'DB_EXPORT_FAILED',
  /** A destructive operation was blocked (e.g. reset in production). */
  DB_RESET_BLOCKED: 'DB_RESET_BLOCKED',
  /** Deleting a record failed. */
  DB_DELETE_FAILED: 'DB_DELETE_FAILED',
  /** The database file appears corrupted. */
  DB_CORRUPTED: 'DB_CORRUPTED',
  /** An unexpected database error occurred. */
  DB_UNKNOWN: 'DB_UNKNOWN',
} as const

export type DatabaseErrorCodeValue = (typeof DatabaseErrorCode)[keyof typeof DatabaseErrorCode]

export interface DatabaseErrorContext {
  /** The business operation that failed, e.g. `user.create`. */
  operation?: string
  /** The affected object type, e.g. `User`. */
  resourceType?: string
  /** The affected primary key. */
  resourceId?: string
  /** The affected database path. */
  path?: string
  [key: string]: unknown
}

export interface DatabaseErrorOptions {
  cause?: unknown
  context?: DatabaseErrorContext
}

export class DatabaseError extends Error {
  readonly code: DatabaseErrorCodeValue
  readonly context: DatabaseErrorContext
  override readonly cause?: unknown

  constructor(code: DatabaseErrorCodeValue, message: string, options: DatabaseErrorOptions = {}) {
    super(message, options.cause !== undefined ? { cause: options.cause } : undefined)
    this.name = 'DatabaseError'
    this.code = code
    this.context = options.context ?? {}
    this.cause = options.cause
  }

  /** Stable JSON representation safe for logs (no secrets). */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
    }
  }
}

export function isDatabaseError(value: unknown): value is DatabaseError {
  return value instanceof DatabaseError
}

/**
 * Re-throws an existing {@link DatabaseError} untouched, otherwise wraps the
 * unknown error into a {@link DatabaseError}. Preserves the original error as
 * the `cause`.
 */
export function toDatabaseError(
  error: unknown,
  code: DatabaseErrorCodeValue,
  message: string,
  context?: DatabaseErrorContext,
): DatabaseError {
  if (isDatabaseError(error)) {
    return error
  }
  return new DatabaseError(code, message, { cause: error, context })
}

/** Extracts a safe, printable message from an unknown error. */
export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  try {
    return JSON.stringify(error)
  } catch {
    return String(error)
  }
}
