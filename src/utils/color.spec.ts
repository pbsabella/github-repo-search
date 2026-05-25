import { describe, it, expect } from 'vitest'
import { langColor } from './color'

describe('langColor', () => {
  it('returns deterministic hue for a given language name', () => {
    expect(langColor('JavaScript')).toBe('hsl(261, 65%, 45%)')
  })

  it('returns a different hue for a different name', () => {
    expect(langColor('TypeScript')).toBe('hsl(245, 65%, 45%)')
  })

  it('handles empty string', () => {
    expect(langColor('')).toBe('hsl(0, 65%, 45%)')
  })

  it('always returns a hue in the 0-359 range', () => {
    for (const name of ['Python', 'Ruby', 'Go', 'Rust', 'C++', 'HTML', 'CSS']) {
      const match = langColor(name).match(/hsl\((\d+),/)
      expect(match).not.toBeNull()

      const hue = parseInt(match![1] ?? '0', 10)
      expect(hue).toBeGreaterThanOrEqual(0)
      expect(hue).toBeLessThan(360)
    }
  })
})
