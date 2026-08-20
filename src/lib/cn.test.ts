import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/cn'

describe('cn utility', () => {
  it('joins class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('drops falsy values', () => {
    expect(cn('foo', false, null, undefined, 0, 'bar')).toBe('foo bar')
  })

  it('returns empty string for no truthy values', () => {
    expect(cn(false, null, undefined)).toBe('')
  })

  it('handles single class', () => {
    expect(cn('only')).toBe('only')
  })

  it('handles numbers', () => {
    expect(cn('count-0', 42, 'end')).toBe('count-0 42 end')
  })
})
