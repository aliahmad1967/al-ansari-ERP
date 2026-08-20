import { describe, it, expect } from 'vitest'
import { newId, newPrefixedId, newDocumentNumber, newShortId } from '@/core/utils/generators'

describe('generators', () => {
  describe('newId', () => {
    it('returns a UUID v4 string', () => {
      const id = newId()
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      )
    })

    it('generates unique IDs', () => {
      const ids = new Set(Array.from({ length: 100 }, () => newId()))
      expect(ids.size).toBe(100)
    })
  })

  describe('newPrefixedId', () => {
    it('returns a prefixed UUID', () => {
      const id = newPrefixedId('emp')
      expect(id).toMatch(/^emp_[0-9a-f]{8}-/)
    })

    it('preserves the prefix', () => {
      const id = newPrefixedId('warehouse')
      expect(id.startsWith('warehouse_')).toBe(true)
    })
  })

  describe('newDocumentNumber', () => {
    it('formats with default width', () => {
      expect(newDocumentNumber('INV', 1)).toBe('INV-000001')
    })

    it('formats with custom width', () => {
      expect(newDocumentNumber('PO', 42, 4)).toBe('PO-0042')
    })

    it('pads to correct width', () => {
      expect(newDocumentNumber('SO', 999)).toBe('SO-000999')
    })

    it('handles zero sequence', () => {
      expect(newDocumentNumber('JE', 0)).toBe('JE-000000')
    })

    it('handles large sequence', () => {
      expect(newDocumentNumber('JE', 123456)).toBe('JE-123456')
    })
  })

  describe('newShortId', () => {
    it('returns a prefixed short ID', () => {
      const id = newShortId('ORG')
      expect(id).toMatch(/^ORG-[a-z0-9]+$/)
    })

    it('uses default length of 6', () => {
      const id = newShortId('USR')
      const suffix = id.split('-')[1]
      expect(suffix!.length).toBe(6)
    })

    it('uses custom length', () => {
      const id = newShortId('USR', 8)
      const suffix = id.split('-')[1]
      expect(suffix!.length).toBe(8)
    })
  })
})
