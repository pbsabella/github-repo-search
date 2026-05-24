import { describe, it, expect } from 'vitest'
import { formatCompactCount, formatDate, formatResetTime } from './format'

describe('formatCompactCount', () => {
  it('formats zero', () => {
    expect(formatCompactCount(0)).toBe('0')
  })

  it('formats values under 1000 without compact notation', () => {
    expect(formatCompactCount(999)).toBe('999')
  })

  it('formats 1000 as 1K', () => {
    expect(formatCompactCount(1000)).toBe('1K')
  })

  it('formats with one decimal for thousands', () => {
    expect(formatCompactCount(1500)).toBe('1.5K')
  })

  it('formats 228000 as 228K', () => {
    expect(formatCompactCount(228000)).toBe('228K')
  })

  it('formats 48000 as 48K', () => {
    expect(formatCompactCount(48000)).toBe('48K')
  })

  it('formats 1000000 as 1M', () => {
    expect(formatCompactCount(1000000)).toBe('1M')
  })

  it('formats 1000000000 as 1B', () => {
    expect(formatCompactCount(1000000000)).toBe('1B')
  })
})

describe('formatDate', () => {
  it('formats an ISO date string as a locale date string', () => {
    expect(formatDate('2013-05-24T16:15:54Z')).toBe(
      new Date('2013-05-24T16:15:54Z').toLocaleDateString(),
    )
  })

  it('formats another ISO date string correctly', () => {
    expect(formatDate('2026-02-17T16:15:54Z')).toBe(
      new Date('2026-02-17T16:15:54Z').toLocaleDateString(),
    )
  })
})

describe('formatResetTime', () => {
  it('returns empty string for zero (no call made yet)', () => {
    expect(formatResetTime(0)).toBe('')
  })

  it('converts unix seconds to a locale time string', () => {
    const unix = 1700000000
    expect(formatResetTime(unix)).toBe(new Date(unix * 1000).toLocaleTimeString())
  })
})
