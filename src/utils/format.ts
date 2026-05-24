const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'short',
})

export function formatCompactCount(count: number): string {
  return compactFormatter.format(count)
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString()
}

export function formatResetTime(unixSeconds: number): string {
  if (!unixSeconds) {
    return ''
  }

  return new Date(unixSeconds * 1000).toLocaleTimeString()
}
