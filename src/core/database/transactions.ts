/**
 * Transaction helpers.
 *
 * All writes to the Realm must run inside a write transaction so related
 * records are updated atomically. {@link withTransaction} is the single helper
 * repositories use; it automatically rolls back when the callback throws.
 */

import type Realm from 'realm'

import { DatabaseErrorCode, toDatabaseError } from './errors'

/**
 * Runs `callback` inside a write transaction.
 *
 * - If a write transaction is already active, the callback runs inside it
 *   (Realm does not allow nested transactions).
 * - On success the transaction is committed.
 * - On error the transaction is cancelled (rolled back) and the error is
 *   wrapped into a {@link DatabaseError} unless it already is one.
 */
export function withTransaction<T>(realm: Realm, callback: () => T): T {
  if (realm.isInTransaction) {
    return callback()
  }

  realm.beginTransaction()
  try {
    const result = callback()
    realm.commitTransaction()
    return result
  } catch (error) {
    if (realm.isInTransaction) {
      realm.cancelTransaction()
    }
    throw toDatabaseError(
      error,
      DatabaseErrorCode.DB_TRANSACTION_FAILED,
      'Database transaction failed and was rolled back.',
      { operation: 'database.transaction', path: realm.path },
    )
  }
}

/** True when a write transaction is currently active on `realm`. */
export function isWriteTransactionActive(realm: Realm): boolean {
  return realm.isInTransaction
}
