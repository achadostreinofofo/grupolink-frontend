import { cn, formatCurrency } from '../utils'

describe('cn', () => {
  it('joins multiple class names', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c')
  })

  it('ignores falsy values', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b')
  })

  it('handles conditional object syntax', () => {
    expect(cn({ active: true, disabled: false })).toBe('active')
  })

  it('merges conflicting tailwind classes (last wins)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('merges text color conflicts', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('returns empty string for no args', () => {
    expect(cn()).toBe('')
  })

  it('handles array of classes', () => {
    expect(cn(['a', 'b'], 'c')).toBe('a b c')
  })

  it('handles custom className override', () => {
    const base = 'px-4 py-2'
    const custom = 'px-6'
    expect(cn(base, custom)).toBe('py-2 px-6')
  })
})

describe('formatCurrency', () => {
  it('formats integer value as BRL', () => {
    const result = formatCurrency(100)
    expect(result).toContain('100')
    expect(result).toContain('R$')
  })

  it('formats decimal value as BRL', () => {
    const result = formatCurrency(29.99)
    expect(result).toContain('29')
    expect(result).toContain('99')
  })

  it('formats zero', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0')
  })

  it('formats large values', () => {
    const result = formatCurrency(1000000)
    expect(result).toContain('1')
    expect(result).toContain('000')
  })

  it('returns a string', () => {
    expect(typeof formatCurrency(10)).toBe('string')
  })
})
