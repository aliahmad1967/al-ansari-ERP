import { describe, it, expect, vi } from 'vitest'
import { withTransaction, isWriteTransactionActive } from '@/core/database/transactions'

function createMockRealm(initialInTransaction = false) {
  let inTransaction = initialInTransaction
  return {
    get isInTransaction() {
      return inTransaction
    },
    beginTransaction: vi.fn(() => {
      inTransaction = true
    }),
    commitTransaction: vi.fn(() => {
      inTransaction = false
    }),
    cancelTransaction: vi.fn(() => {
      inTransaction = false
    }),
    path: 'test.realm',
  } as unknown as import('realm').Realm
}

describe('transaction helpers', () => {
  describe('withTransaction', () => {
    it('commits the transaction on success', () => {
      const realm = createMockRealm()
      const result = withTransaction(realm, () => 42)
      expect(result).toBe(42)
      expect(realm.beginTransaction).toHaveBeenCalledOnce()
      expect(realm.commitTransaction).toHaveBeenCalledOnce()
    })

    it('rolls back on error', () => {
      const realm = createMockRealm()
      expect(() =>
        withTransaction(realm, () => {
          throw new Error('fail')
        }),
      ).toThrow()
      expect(realm.cancelTransaction).toHaveBeenCalledOnce()
      expect(realm.commitTransaction).not.toHaveBeenCalled()
    })

    it('runs callback directly when already in transaction', () => {
      const realm = createMockRealm(true)
      const result = withTransaction(realm, () => 'nested')
      expect(result).toBe('nested')
      expect(realm.beginTransaction).not.toHaveBeenCalled()
      expect(realm.commitTransaction).not.toHaveBeenCalled()
    })

    it('returns callback result', () => {
      const realm = createMockRealm()
      const result = withTransaction(realm, () => ({ key: 'value' }))
      expect(result).toEqual({ key: 'value' })
    })
  })

  describe('isWriteTransactionActive', () => {
    it('returns true when in transaction', () => {
      const realm = createMockRealm(true)
      expect(isWriteTransactionActive(realm)).toBe(true)
    })

    it('returns false when not in transaction', () => {
      const realm = createMockRealm(false)
      expect(isWriteTransactionActive(realm)).toBe(false)
    })
  })
})
