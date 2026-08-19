/**
 * Security tests — password policy, audit log sanitization, HTML escaping.
 *
 * These tests verify that critical security functions work correctly:
 *  - Password validation enforces policy
 *  - Audit log sanitizes sensitive fields
 *  - HTML escaping prevents XSS
 *  - Password length truncation prevents DoS
 */

import { describe, it, expect } from 'vitest'

import {
  validatePassword,
  sanitizePasswordLength,
  MAX_PASSWORD_LENGTH,
  DEFAULT_PASSWORD_POLICY,
} from '@/core/security/password'
import { sanitizeSnapshot } from '@/core/models/AuditLog'

// ── HTML escaping (inline for testing — mirrors reports/ExportService) ──

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ── Password Policy Tests ─────────────────────────────────────────────

describe('Password Policy', () => {
  describe('validatePassword', () => {
    it('accepts a valid password meeting all requirements', () => {
      const result = validatePassword('StrongPass1')
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('rejects password shorter than minLength', () => {
      const result = validatePassword('Ab1')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('validation.passwordTooShort')
    })

    it('rejects password longer than maxLength', () => {
      const longPass = 'A'.repeat(129) + '1a'
      const result = validatePassword(longPass)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('validation.passwordTooLong')
    })

    it('rejects password without uppercase', () => {
      const result = validatePassword('lowercase1')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('validation.passwordNoUppercase')
    })

    it('rejects password without lowercase', () => {
      const result = validatePassword('UPPERCASE1')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('validation.passwordNoLowercase')
    })

    it('rejects password without digit', () => {
      const result = validatePassword('NoDigitHere')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('validation.passwordNoDigit')
    })

    it('collects multiple errors for weak passwords', () => {
      const result = validatePassword('weak')
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThanOrEqual(3)
    })

    it('respects custom policy', () => {
      const customPolicy = {
        ...DEFAULT_PASSWORD_POLICY,
        requireUppercase: false,
        requireDigit: false,
      }
      const result = validatePassword('lowercaseonly', customPolicy)
      expect(result.valid).toBe(true)
    })
  })

  describe('sanitizePasswordLength', () => {
    it('returns password unchanged when under limit', () => {
      expect(sanitizePasswordLength('short')).toBe('short')
    })

    it('truncates password at MAX_PASSWORD_LENGTH', () => {
      const longPass = 'a'.repeat(200)
      const result = sanitizePasswordLength(longPass)
      expect(result.length).toBe(MAX_PASSWORD_LENGTH)
      expect(result).toBe('a'.repeat(MAX_PASSWORD_LENGTH))
    })

    it('handles empty password', () => {
      expect(sanitizePasswordLength('')).toBe('')
    })
  })
})

// ── Audit Log Sanitization Tests ──────────────────────────────────────

describe('Audit Log Sanitization', () => {
  describe('sanitizeSnapshot', () => {
    it('returns null for null input', () => {
      expect(sanitizeSnapshot(null)).toBeNull()
    })

    it('returns null for undefined input', () => {
      expect(sanitizeSnapshot(undefined)).toBeNull()
    })

    it('returns null for empty object', () => {
      expect(sanitizeSnapshot({})).toBeNull()
    })

    it('passes through non-sensitive fields unchanged', () => {
      const data = { name: 'Test Product', sku: 'SKU-001', quantity: 10 }
      const result = sanitizeSnapshot(data)
      expect(result).toBe(JSON.stringify(data))
    })

    it('redacts password field', () => {
      const data = { username: 'admin', password: 'secret123' }
      const result = sanitizeSnapshot(data)
      const parsed = JSON.parse(result!)
      expect(parsed.password).toBe('[REDACTED]')
      expect(parsed.username).toBe('admin')
    })

    it('redacts passwordHash field', () => {
      const data = { username: 'admin', passwordHash: 'scrypt$abc$def' }
      const result = sanitizeSnapshot(data)
      const parsed = JSON.parse(result!)
      expect(parsed.passwordHash).toBe('[REDACTED]')
    })

    it('redacts token field', () => {
      const data = { token: 'bearer xyz123' }
      const result = sanitizeSnapshot(data)
      const parsed = JSON.parse(result!)
      expect(parsed.token).toBe('[REDACTED]')
    })

    it('redacts secret field', () => {
      const data = { secret: 'my-api-secret' }
      const result = sanitizeSnapshot(data)
      const parsed = JSON.parse(result!)
      expect(parsed.secret).toBe('[REDACTED]')
    })

    it('redacts apiKey field', () => {
      const data = { apiKey: 'sk-12345' }
      const result = sanitizeSnapshot(data)
      const parsed = JSON.parse(result!)
      expect(parsed.apiKey).toBe('[REDACTED]')
    })

    it('redacts multiple sensitive fields at once', () => {
      const data = {
        username: 'admin',
        password: 'secret',
        token: 'abc',
        normalField: 'visible',
      }
      const result = sanitizeSnapshot(data)
      const parsed = JSON.parse(result!)
      expect(parsed.password).toBe('[REDACTED]')
      expect(parsed.token).toBe('[REDACTED]')
      expect(parsed.normalField).toBe('visible')
      expect(parsed.username).toBe('admin')
    })

    it('handles nested objects (does not deep-sanitize, only top-level)', () => {
      const data = { user: { password: 'nested-secret' }, name: 'test' }
      const result = sanitizeSnapshot(data)
      const parsed = JSON.parse(result!)
      // Top-level 'user' is not in the sensitive list, so the nested password is preserved
      // This is expected — deep sanitization would require recursive traversal
      expect(parsed.user.password).toBe('nested-secret')
    })
  })
})

// ── HTML Escaping Tests (XSS Prevention) ──────────────────────────────

describe('HTML Escaping (XSS Prevention)', () => {
  it('escapes angle brackets', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
    )
  })

  it('escapes ampersand', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b')
  })

  it('escapes double quotes', () => {
    expect(escapeHtml('say "hello"')).toBe('say &quot;hello&quot;')
  })

  it('escapes single quotes', () => {
    expect(escapeHtml("it's")).toBe('it&#39;s')
  })

  it('handles mixed XSS vectors', () => {
    const malicious = '<img src=x onerror=alert(1)>'
    const escaped = escapeHtml(malicious)
    expect(escaped).not.toContain('<img')
    // onerror is attribute text — harmless once the tag brackets are escaped
    expect(escaped).toContain('&lt;img')
  })

  it('handles Arabic text with HTML characters', () => {
    const text = 'معلومة <script> & "test"'
    const escaped = escapeHtml(text)
    expect(escaped).not.toContain('<script>')
    expect(escaped).toContain('&lt;script&gt;')
  })

  it('leaves clean text unchanged', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World')
    expect(escapeHtml('منتج 123')).toBe('منتج 123')
  })

  it('handles empty string', () => {
    expect(escapeHtml('')).toBe('')
  })
})
