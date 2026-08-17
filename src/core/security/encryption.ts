/**
 * Password hashing — scrypt with a per-password salt.
 *
 * Never store plain-text passwords. This module is the single source of truth
 * for credential hashing across services.
 */

import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const SCRYPT_KEY_LENGTH = 64
const SALT_BYTES = 16

/** Hashes a plain-text password into a `scrypt$<salt>$<hash>` string. */
export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_BYTES).toString('hex')
  const hash = scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString('hex')
  return `scrypt$${salt}$${hash}`
}

/** Verifies a plain-text password against a stored hash (timing-safe). */
export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split('$')
  if (scheme !== 'scrypt' || !salt || !hash) return false

  const candidate = scryptSync(password, salt, SCRYPT_KEY_LENGTH)
  const expected = Buffer.from(hash, 'hex')
  if (candidate.length !== expected.length) return false
  return timingSafeEqual(candidate, expected)
}
