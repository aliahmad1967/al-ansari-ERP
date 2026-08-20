import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from '@/core/security/encryption'

describe('encryption', () => {
  describe('hashPassword', () => {
    it('returns a scrypt hash string', () => {
      const hash = hashPassword('mypassword')
      expect(hash).toMatch(/^scrypt\$[a-f0-9]+\$[a-f0-9]+$/)
    })

    it('produces different hashes for the same password (random salt)', () => {
      const hash1 = hashPassword('mypassword')
      const hash2 = hashPassword('mypassword')
      expect(hash1).not.toBe(hash2)
    })

    it('produces valid format with three segments', () => {
      const hash = hashPassword('test')
      const parts = hash.split('$')
      expect(parts).toHaveLength(3)
      expect(parts[0]).toBe('scrypt')
      expect(parts[1]!.length).toBe(32)
      expect(parts[2]!.length).toBe(128)
    })
  })

  describe('verifyPassword', () => {
    it('returns true for correct password', () => {
      const hash = hashPassword('correct123')
      expect(verifyPassword('correct123', hash)).toBe(true)
    })

    it('returns false for incorrect password', () => {
      const hash = hashPassword('correct123')
      expect(verifyPassword('wrong123', hash)).toBe(false)
    })

    it('returns false for malformed hash', () => {
      expect(verifyPassword('password', 'not-a-valid-hash')).toBe(false)
    })

    it('returns false for empty hash', () => {
      expect(verifyPassword('password', '')).toBe(false)
    })

    it('returns false for wrong scheme', () => {
      expect(verifyPassword('password', 'bcrypt$abc$def')).toBe(false)
    })

    it('handles Arabic passwords', () => {
      const hash = hashPassword('كلمةالمرور123')
      expect(verifyPassword('كلمةالمرور123', hash)).toBe(true)
    })
  })
})
